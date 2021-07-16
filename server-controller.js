//This module will not run when we test.

const knex = require('knex');
const app = require("./server");
const { PORT, DATABASE_URL } = require("./config");

const db = knex({
    client: 'pg',
    connection: DATABASE_URL
});

//using express feature to set a property on the express app called "db" which 
//will hold our knex database connection. We will use this knex connection in our 
//handlers when someone makes request to ... app.use('/api/articles', articlesRouter) ---> router.get('/', articleControllers.getAllArticles);  --->  
app.set('db', db);

//start server
app.listen(PORT, () => {
    console.log(`Now listening on PORT ${PORT} at http://localhost:${PORT}`);
});
