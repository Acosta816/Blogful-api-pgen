"use strict";
const express = require('express');
const router = express.Router();

const articleControllers = require('../controllers/articlesController');

// const knexInstance = req.app.get('db');

//---------------------Routes----------------------------------------//

//GET all articles
router.get('/', articleControllers.getAllArticles);


//GET by :id
router.get('/:articleId', articleControllers.getArticleById);

// //GET places by place's creator id
// router.get('/user/:id', placeControllers.getPlacesByCreatorId);

// //JWT middleware. If a request does not have a valid token, it won't make it past this middleware.
// //As you can see we place it below the get routes since we don't need authentication to simply retrieve routes, just to alter them.
// router.use(checkAuth);

//POST a new article
router.post('/',  articleControllers.insertArticle);

// //PATCH an existing place by id
// router.patch('/:id', placeControllers.patchPlaceById);

router.delete('/:articleId', articleControllers.deleteArticleById); //NOTE: <===============CREATE A NEW CONTROLLER FUNCTION FOR THIS!!!!


module.exports = router;