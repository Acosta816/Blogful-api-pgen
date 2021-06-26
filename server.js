"use strict";
//imports
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');//helps to hide sensetive header info
// const cors = require('cors');

//import environment variables.
const { NODE_ENV } = require('./config');

//import Routers
const pokemonRouter = require('./Routers/pokedexRouter');

//create express app
const app = express();

//preliminary middleware
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'; //log the http layer. But check if we are in production. If so, we use tiny for minimal logging.
app.use(morgan(morganSetting))
app.use(helmet());//hide certain headers
// app.use(cors()); //<--this is optional. we rolled out our own cors middleware below.
app.use(express.json());//parse incoming json from PUT or POST


//Rolled out our own Cors middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Origin, X-Requested-With, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE, OPTIONS');
    next();
});

//apply Router middleware for base paths
app.use('/api/pokemon', pokemonRouter);

//This is just for testing:
app.get('/', (req, res) => {
    res.send('Hello, world!')
    });

// catch-all endpoint if client makes request to non-existent endpoint
app.use("*", function (req, res) {
    return res.status(404).json({ message: "🌴Page Not Found👻" });
});
//alternative to above.....
//import the HttpError class model we made and use it below
/*
app.use((req, res, next) => {
    const error = new HttpError("🌴Page Not Found👻", 404);
    throw error;
});
*/


//Thinkful recommended ERROR HANDLER that only displays the call stack when in dev mode, NOT in production code.
// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
    let response
    if (NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
  });



//export the app to be used by server-controller
module.exports = app;

