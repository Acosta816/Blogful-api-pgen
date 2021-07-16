const UsersService = require("../models/usersService");
const HttpError = require("../models/http-error");
const xss = require('xss');



//----------------------------------Pure logic for handling requests using the imported UsersService Model

//-------------------------------Get all users-------------------------------------------
const getAllUsers = (req, res, next) => {
    const knexInstance = req.app.get('db'); //using the knexInstance we set on app from within server-controller
    UsersService.getAllUsers(knexInstance)
        .then(users => {
            res.status(200).json(users)
        })
        .catch(next)
};


//-------------------------------Get user by id-------------------------------------------
const getUserById = (req, res, next) => {
    const knexInstance = req.app.get('db');
    const itemId = req.params.userId;
    UsersService.getUserById(knexInstance, itemId)
        .then(user => {
            if(!user) {
                return res.status(404).json({
                    error: {code: 404, message: `User does not exist! Whoops. Check the id.`}
                });
            }

            //Sanatize the user before sending it to client...
            const sanitizedUser = { 
                id: user.id, 
                fullname: xss(user.fullname), 
                username : xss(user.username), 
                nickname : xss(user.nickname),
                date_created: user.date_created
            };

            res.status(200).json(sanitizedUser);
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
const insertUser = (req, res, next) => {
    console.log('POSTing new user');
    const knexInstance = req.app.get('db');

    /*
    Note: alternative to checking requiredFields...
        const validationErrors = validationResult(req);
        if(!validationErrors.isEmpty()) {
            throw new HttpError('Invalid inputs, please check and submit again.', 422)
        }; 
    */

    //Make sure all required fields exist in req.body
    const requiredFields = ["fullname", "username"];
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


    const { fullname, username, nickname, password } = req.body;

    const newUser = { fullname, username, nickname, password };

        UsersService.insertUser(knexInstance, newUser)
        .then(user => {
            return res.status(201).location(`api/users/${user.id}`).json(user);
        })
        .catch(err => {
            const error = new HttpError(`Failed Creating user: ${err}`, 500);
            return next(error);
        });
};
//--------------------------------END of POST /users-----------------------------------//



//-----------------PATCH an existing user by id-----------------------------------------
const patchUserById = (req, res, next) => {
    console.log('Updating user...');
    const knexInstance = req.app.get('db');


    //Check if the article exists first...
    UsersService.getUserById(knexInstance, req.params.userId)
        .then(user => {
            console.log(user);
            if(!user) {
                return res.status(404).json({
                    error: {code: 404, message: `User does not exist! Whoops. Check the id.`}
                });
            }

            //Ok, we made it this far so the item does indeed exist, lets update now...
            //make new object out of all valid fields in updateableFields
            const updateableFields = ["fullname", "username", "nickname", "password"];
            const newBody = {};
            updateableFields.forEach(field => {
                if (field in req.body) {
                    newBody[field] = req.body[field];
                };
            });

            //If newbody's length is 0, return 404 'Make sure your fields are one of ["fullname", "username", "nickname", "password"]
            console.log(Object.keys(newBody).length);
            if(Object.keys(newBody).length === 0) {
                return res.status(400).json({
                    error: {code: 400, message: `In order to update this item, make sure your fields are one of ["fullname", "username", "nickname", "password"]`}
                })
            }

            UsersService.updateUserById(knexInstance, req.params.userId, newBody)
                .then(response => {

                    //Now that weve updated the user, we will fetch it to see if it works but we won't return it to the user.
                    UsersService.getUserById(knexInstance, req.params.userId)
                    .then(user => console.log(user))
                    .then( response => res.status(204).end());
                })
                .catch(next);


        })
        .catch(next);


};
//--------------------------------END of PATCH /users/:userId-----------------------------------//



//---------------DELETE /users/:userId-------------------------------------------------------
const deleteUserById = (req, res, next) => {
    console.log('Attempting to DELETE user');
    const knexInstance = req.app.get('db');
    const userId = req.params.userId;

    //check if id exists first...
    UsersService.getUserById(knexInstance, userId)
        .then(user => {
            if(!user) {
                return res.status(404).json({
                    error: {code: 404, message: `User does not exist! Whoops. Check the id.`}
                });
            }

            //Ok looks like the user does exist, let's delete it
            UsersService.deleteUserById(knexInstance, userId)
            .then(() => {
                // console.log(response.body);
                return res.status(204).end();
            })
            .catch(err => {
                const error = new HttpError(`Failed to delete user, ${err.reason}.`, 500);
                return next(error);
            });

        });
        

};//end of delete-----------





module.exports = {
    getAllUsers,
    getUserById,
    insertUser,
    patchUserById,
    deleteUserById,
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