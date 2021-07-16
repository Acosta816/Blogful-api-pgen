"use strict";
const express = require('express');
const router = express.Router();

const usersControllers = require('../controllers/usersController');




//---------------------Routes----------------------------------------//

//GET all users
router.get('/', usersControllers.getAllUsers);


//GET by :id
router.get('/:userId', usersControllers.getUserById);

// //GET places by place's creator id
// router.get('/user/:id', placeControllers.getPlacesByCreatorId);

// //JWT middleware. If a request does not have a valid token, it won't make it past this middleware.
// //As you can see we place it below the get routes since we don't need authentication to simply retrieve routes, just to alter them.
// router.use(checkAuth);

//POST a new article
router.post('/',  usersControllers.insertUser);

//PATCH an existing place by id
router.patch('/:userId', usersControllers.patchUserById);

router.delete('/:userId', usersControllers.deleteUserById); //NOTE: <===============CREATE A NEW CONTROLLER FUNCTION FOR THIS!!!!


module.exports = router;