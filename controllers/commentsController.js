//import CommentsService, xss, and HttpError
const CommentsService = require('../models/commentsService');
const HttpError = require('../models/http-error');
const xss = require('xss');


//Request Handler logic for CRUDing comments...

const getAllComments = (req, res, next) => {
    //grab the knexInstance 'db' that we set on the app in server-controller.js
    const knexInstance = req.app.get('db');

    CommentsService.getAllComments(knexInstance)
        .then(comments => {
            res.status(200).json(comments);
        })
        .catch(next)

};//end of getAllComments



const getCommentById = (req, res, next) => {
    //grab the knexInstance set on req.app from server-controller.js
    const knexInstance = req.app.get('db');
    const {commentId} = req.params;

    CommentsService.getCommentById(knexInstance, commentId)
        .then(comment => {
            //check if it returned a comment
            if(!comment) {
                return res.status(404).json({
                    error: {code: 404, message: `Comment does not exist! Whoops. Check the id.`}
                });
            }

            //made it this far so comment exists, now sanatize the comment
            const saniComment = {
                id: comment.id,
                content: xss(comment.content),
                date_commented: comment.date_commented,
                article_id: comment.article_id,
                user_id: comment.user_id
            };

            //return saniComment
            return res.status(200).json(saniComment).end();

        })
        .catch();
};//end of getCommentById



const insertComment = (req, res, next) => {
    //grab knexInstance
    const knexInstance = req.app.get('db');
    
    //Make sure all required fields exist in req.body
    const requiredFields = ["content", "article_id", "user_id"];
    const missingFields = [];

    requiredFields.forEach(field => {
        if(!req.body[field]) {
            missingFields.push(field);
        }
    });
    //if any missing fields, send an error
    if(missingFields.length > 0) {
        return res.status(422).json( {error: 422, message: `Missing following fields: '${missingFields}'`});
    }

    //now form the newComment
    const {content, article_id, user_id} = req.body;
    const newComment = {content, article_id, user_id};

    CommentsService.insertComment(knexInstance, newComment)
        .then(comment => {
            return res.status(201).json(comment);
        })
        .catch(err => {
            const error = new HttpError(`Failed Creating comment: ${err}`, 500);
            return next(error)
        });

};//end of insertComment



const updateCommentById = (req, res, next) => {
    //grab the knexInstance
    const knexInstance = req.app.get('db');
    const commentId = req.params.commentId;

    console.log(`Attempting to update comment "${commentId}"...`)
    //check if it exists
    CommentsService.getCommentById(knexInstance, commentId)
        .then(comment => {
            if(!comment){
                return res.status(404).json({
                    error: {code: 404, message: `Comment does not exist! Whoops. Check the id.`}
                });
            }

            //ok it exists, now check if content property exists and is not empty
            if(!req.body.content || req.body.content.length < 1) {
                return res.status(400).json({
                    error: {code: 400, message: `In order to update this item, make sure you include content`}
                })
            }

            //ok, content is not missing, now Update!
            CommentsService.updateCommentById(knexInstance, commentId, req.body)
                .then(response => {
                    return res.status(204).end();
                })
                .catch(next);


        })
        .catch(next)

};//end of updateCommentById


//---------------DELETE /comment/:commentId-------------------------------------------------------
const deleteCommentById = (req, res, next) => {
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
    getAllComments,
    getCommentById,
    insertComment,
    updateCommentById,
    deleteCommentById
}