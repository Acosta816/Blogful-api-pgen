const ArticlesService = require("../models/articlesService");
const HttpError = require("../models/http-error");
const xss = require('xss');



//----------------------------------Pure logic for handling requests using the imported ArticlesService Model (remember, the imported model just makes sql queries like a mongoose model did behind the scenes with Author.getById() etc)...--------------------------

const getAllArticles = (req, res, next) => {
    const knexInstance = req.app.get('db'); //using the knexInstance we set on app from within server-controller
    ArticlesService.getAllArticles(knexInstance)
        .then(articles => {
            res.status(200).json(articles)
        })
        .catch(next)
};


//-------------------------------Get article by id-------------------------------------------
const getArticleById = (req, res, next) => {
    const knexInstance = req.app.get('db');
    const itemId = req.params.articleId;
    ArticlesService.getArticleById(knexInstance, itemId)
        .then(article => {
            if(!article) {
                return res.status(404).json({
                    error: {code: 404, message: `Article does not exist! Whoops. Check the id.`}
                });
            }

            //Sanatize the article before sending it to client...
            const sanitizedArticle = { 
                id: article.id, 
                style: article.style, 
                title : xss(article.title), 
                content : xss(article.content),
                author: article.author,
                date_published: article.date_published
            };

            res.status(200).json(sanitizedArticle);
        })
        .catch(next)
    

};
//--------------------------------END of GET /places/:id-----------------------------------//



//Get place by place's creator id
const getPlacesByCreatorId = (req, res, next) => {
    console.log('Getting places by place creator id');
    const filter = { creator: req.params.id };
    Place.find(filter)
        .then(places => {
            if (places.length < 1) {
                return next(new HttpError('Could not find any place for the provided creator id.', 404));
            }

            return res.status(200).json(places.map(plc => plc.easyRead())).end();
        })
        .catch(err => {
            const error = new HttpError(`Could not fetch any places, internal server error, whoops, sorry! :S ${err.reason}`, 500);
            return next(error);
        });

};
//--------------------------------END of GET /places/user/:id-----------------------------------//



//---------------POST new article-------------------------------------------------------
const insertArticle = (req, res, next) => {
    console.log('POSTing new article');
    const knexInstance = req.app.get('db');

    /*
    Note: alternative to checking requiredFields...
        const validationErrors = validationResult(req);
        if(!validationErrors.isEmpty()) {
            throw new HttpError('Invalid inputs, please check and submit again.', 422)
        }; 
    */

    //Make sure all required fields exist in req.body
    const requiredFields = ["title", "content", "style"]; //"author" is not absolutley necessary I guess. not sure why thinkful did that."
    const missingFields = [];
    requiredFields.forEach(field => {
        if (!req.body[field]) {
            missingFields.push(field);
        };
    });
    //if there are any missing fields, throw error.
    if (missingFields.length > 0) {
        return res.status(422).json( {error: 422, message: `Missing following fields: '${missingFields}'`});
        // return next(new HttpError(`Missing following fields: '${missingFields}'`, 422));
    }


    const { title, content, style, author, date_published } = req.body;

    const newArticle = { title, content, style, author, date_published };

    ArticlesService.insertArticle(knexInstance, newArticle)
        .then(art => {
            return res.status(201).location(`/api/articles/${art.id}`).json(art);
        })
        .catch(err => {
            // const error = new HttpError(`Failed Creating article: ${err}`, 500);
            // return next(error)
            next(err);
        });
};
//--------------------------------END of POST /articles-----------------------------------//



//-----------------PATCH an existing article by id-----------------------------------------
const patchArticleById = (req, res, next) => {
    console.log('Updating article...');
    const knexInstance = req.app.get('db');


    //Check if the article exists first...
    ArticlesService.getArticleById(knexInstance, req.params.articleId)
        .then(article => {
            if(!article) {
                return res.status(404).json({
                    error: {code: 404, message: `Article does not exist! Whoops. Check the id.`}
                });
            }

            //Ok, we made it this far so the item does indeed exist, lets update now...
            //make new object out of all valid fields in updateableFields
            const updateableFields = ["title", "content", "style"];
            const newBody = {};
            updateableFields.forEach(field => {
                if (field in req.body) {
                    newBody[field] = req.body[field];
                };
            });

            //If newbody's length is 0, return 404 'Make sure your fields are one of [title, content, sytle]
            // console.log(Object.keys(newBody).length);
            if(Object.keys(newBody).length === 0) {
                return res.status(400).json({
                    error: {code: 400, message: `In order to update this item, make sure your fields are one of [title, content, sytle]`}
                })
            }
            
            ArticlesService.updateArticleById(knexInstance, req.params.articleId, newBody)
                .then(response => {

                    ArticlesService.getArticleById(knexInstance, req.params.articleId)
                        // .then(article => console.log(article))
                        .then(response => res.status(204).end());
                    // return res.status(204).end();
                })
                .catch(next);


        })
        .catch(next);


};
//--------------------------------END of PATCH /article/:id-----------------------------------//



//-----------------PATCH an existing place using id-----------------------------------------
const patchPlaceById = (req, res, next) => {
    console.log('Updating article...');
    const knexInstance = req.app.get('db');

    //make new object out of all valid fields in updateableFields
    const updateableFields = ["title", "description", "image"];
    const newBody = {};
    updateableFields.forEach(field => {
        if (field in req.body) {
            newBody[field] = req.body[field];
        };
    });


    Place.findById(req.params.id)
        .then(place => {

            //if place was found, validate that the user logged in is authorized to update it.
            if (place.creator.id !== req.userData.userId) {
                const error = new HttpError(`You are not authorized to edit this place.`, 401);
                return next(error);
            };

            //if authorized, update as intended.
            Place.findByIdAndUpdate(req.params.id, { $set: newBody }, { new: true })
                .then(place => {
                    Place.findById(place.id)
                        .then(plc => {
                            return res.status(200).json(plc.easyRead()).end();
                        });
                })
                .catch(err => {
                    const error = new HttpError(`Failed to update place, ${err.reason}.`, 500);
                    return next(error);
                });

        })
        .catch(err => {
            const error = new HttpError(`Could not find place. ${err.reason}.`, 500);
            return next(error);
        });




};
//--------------------------------END of PATCH /places/:id-----------------------------------//



//---------------DELETE /articles/:articleId-------------------------------------------------------
const deleteArticleById = (req, res, next) => {
    console.log('Attempting to DELETE article');
    const knexInstance = req.app.get('db');
    const itemId = req.params.articleId;

    //check if id exists first...
    ArticlesService.getArticleById(knexInstance, itemId)
        .then(article => {
            if(!article) {
                return res.status(404).json({
                    error: {code: 404, message: `Article does not exist! Whoops. Check the id.`}
                });
            }

            //Ok looks like the article does exist, let's delete it
            ArticlesService.deleteArticleById(knexInstance, itemId)
            .then(() => {
                // console.log(response.body);
                return res.status(204).end();
            })
            .catch(err => {
                const error = new HttpError(`Failed to delete place, ${err.reason}.`, 500);
                return next(error);
            });

        });
        

};//end of delete-----------





module.exports = {
    getAllArticles,
    getArticleById,
    insertArticle,
    patchArticleById,
    deleteArticleById,
    getPlacesByCreatorId,
    patchPlaceById,
};
// exports.getPlaceById = getPlaceById;
// exports.getPlacesByCreatorId = getPlacesByCreatorId;


/*NOTE: for validation, we can also use 'express-validator' package.
  exmaple: within the function, you would write...

    const validationErrors = validationResult(req);  pass the req object to validationResults() and you get a scanned/checked version of the req object that's been checked against the rules that you set up in the placeRouter.js.
    if(!validationErrors.isEmpty()) {
        throw new HttpError('Invalid inputs, please check and submit again.', 422)
    };

*/