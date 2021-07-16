"use strict";
const express = require('express');
const router = express.Router();

const commentsControllers = require('../controllers/commentsController');




//---------------------Routes----------------------------------------//

//GET all comments
router.get('/', commentsControllers.getAllComments);


//GET by :id
router.get('/:commentId', commentsControllers.getCommentById);

// //GET places by place's creator id
// router.get('/user/:id', placeControllers.getPlacesByCreatorId);

// //JWT middleware. If a request does not have a valid token, it won't make it past this middleware.
// //As you can see we place it below the get routes since we don't need authentication to simply retrieve routes, just to alter them.
// router.use(checkAuth);

//POST a new comment
router.post('/',  commentsControllers.insertComment);

//PATCH an existing place by id
router.patch('/:commentId', commentsControllers.updateCommentById);

router.delete('/:commentId', commentsControllers.deleteCommentById); //NOTE: <===============CREATE A NEW CONTROLLER FUNCTION FOR THIS!!!!


module.exports = router;