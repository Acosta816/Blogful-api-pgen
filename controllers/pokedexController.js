
require('dotenv').config();


//-------------------------Pure logic for handling requests...-----------------------//


//------------------------------Get pokemon by Type-----------------------------//
const getPokemonById = (req, res, next) => {
    res.send(process.env.EXAMPLE);
};//end of getPokemonById




//this is where you would export the logic getPokemonById, getPokemonByType, etc
module.exports = {
    getPokemonById
};