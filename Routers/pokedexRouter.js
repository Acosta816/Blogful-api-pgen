"use strict";
const express = require('express');
const router = express.Router();

const pokedexControllers = require('../controllers/pokedexController');




//---------------------Routes----------------------------------------//

//Get pokemon by id...
router.get('/:id', pokedexControllers.getPokemonById);


// //GET by :id
// router.get('/:id', placeControllers.getPlaceById);

// //GET places by place's creator id
// router.get('/user/:id', placeControllers.getPlacesByCreatorId);

// //JWT middleware. If a request does not have a valid token, it won't make it past this middleware.
// //As you can see we place it below the get routes since we don't need authentication to simply retrieve routes, just to alter them.
// router.use(checkAuth);

// //POST a new place
// router.post('/', fileUpload.single('image'), placeControllers.createNewPlace);

// //PATCH an existing place by id
// router.patch('/:id', placeControllers.patchPlaceById);

// router.delete('/:id', placeControllers.deletePlaceById); //NOTE: <===============CREATE A NEW CONTROLLER FUNCTION FOR THIS!!!!


module.exports = router;