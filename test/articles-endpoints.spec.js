const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const { TEST_DB_URL } = require('../config');//using this approach since it utilizes the config.js file
const app = require('../server');
const { makeArticlesArray } = require('./articles.fixtures');

//----Test Suite
describe.only('-----Articles Endpoints test suite------', function() {
//--------SET UP TESTING ENVIRONMENT---------------------------------------------
    let db;//create now and assign it's value later

    before('initiate "knex" instance that connects to TEST_DB_URL', () => {
        //initiate knex instance that connects to test db
        db = knex({
            client: 'pg',
            connection: TEST_DB_URL
        });

        //using express's "set" method, set a property called 'db' (which is our knex instance) on the express app
        app.set('db', db);

    });//---end of before

    
    after('disconnect from db', () => db.destroy()); //<--after all the tests, disconnect from test db

    //before any testing begins, lets make sure we are starting clean.
    before('clean the table of all data before any testing begins', () => db('blogful_articles').truncate());

    afterEach('clear the table after each top level describe.', () => db('blogful_articles').truncate());


//--------------------------TESTS BELOW----------------------------------------------------------


    //========================= GET /articles ===============================================
    describe('----------------------------------"GET /articles"------------------------------', () => {
        context('(Given NO articles in database)', () => {
            it('returns EMPTY list and 200', () => {
                return supertest(app)
                    .get('/api/articles')
                    .expect(200,[]);
            });//end of it
        });//end of desc.


        context('(Given there ARE articles in the database)', () => {
            //-------TEST SETUP------------
            //create some test articles to insert
            const testArticles = makeArticlesArray();

            //"within this context scope", before each test in here, insert some test articles.
            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
                    // .returning('*')
                    // .then(articles => console.log(articles)); <--only if we want to see that the data was inserted. commented out for now.
            });
       //----------TEST BEGIN------------------------
            it('returns ALL articles & 200', () => {
                //calling the "get" method on app
                return supertest(app)
                    .get('/api/articles')
                    .then(res => {
                        // console.log('--------------------sent get request-----------')
                        // console.log(res.body); //checking res.body
                        expect(200, testArticles);
                    });
    
            });//end of GET /articles
        });//end

    });//-----------------------END of GET /articles-----------------------------------------------




    //========================= GET /articles/:articleId ===============================================
    //we can use 'context' to describe the app when it's in a certain state
    describe('----------------------------------"GET /articles/:articleId"------------------------------', () => {

        context('(Given NO data in database)', () => {
            it('returns a 404 and error message', () => {
                const articleId = 12345;
                return supertest(app)
                    .get(`/api/articles/${articleId}`)
                    .expect(404, {
                        error: {code: 404, message: `Article does not exist! Whoops. Check the id.`}
                    });
            });//end of it
        });//end of context: NO data


        context('(Given there ARE articles in the database)', () => {
        //------TEST SETUP----------------------------
            //create some test articles to insert
            const testArticles = makeArticlesArray();
            //"within this context scope", before each test in here, insert some test articles.
            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
                    // .returning('*')
                    // .then(articles => console.log(articles)); <--only if we want to see that the data was inserted. commented out for now.
            });
        //----------TESTS BEGIN------------------------
            it('returns specified article & 200', () => {
                const articleId = 3;
                const expectedArticle = testArticles[articleId - 1];
                return supertest(app)
                    .get(`/api/articles/${articleId}`)
                    .expect(200, expectedArticle);
            });
            
        });//end of context: w/data

        context('(Given an XSS attack article)', () => {
            //------TEST SETUP----------------------------
            //create XSS article to insert
            const maliciousArticle = {
                id: 911, 
                title: 'Naughty naughty very naughty <script>alert("xss");</script>',
                style: 'How-to',
                content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
            };
            
            beforeEach('insert XSS article', () => {
                return db
                    .into('blogful_articles')
                    .insert([maliciousArticle])
                    // .returning('*')
                    // .then(articles => console.log(articles)); <--only if we want to see that the data was inserted. commented out for now.
            });
        //----------TESTS BEGIN------------------------
            it('Sanatizes/removes XSS attack content.', () => {
                return supertest(app)
                    .get(`/api/articles/${maliciousArticle.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;');
                        expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`);
                    })
            });
        });//end of context: xss attack
        

    });//-----------------------END of GET /articles/:articleId-----------------------------------------------



    //========================= POST /articles ===============================================
    describe('----------------------------------"POST /articles"------------------------------', () => {
        it('returns a 201 & the newly created article', function() {
            this.retries(3);//had to turn the arrow function into an expression in order to make "this" point to the it-block to use this.retries(). We use this to make it retry a specified number of times in a row. We did this since the date might be off on the tested object making this it-block fail.
            const newArticle = {title: 'New Article', content: 'This is my new article. Check it out and let me know what you think.', style: 'Story'};
            return supertest(app)
                .post('/api/articles')
                .send(newArticle)
                .expect(201)
                .expect(res => {
                    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
                    console.log(res.body);
                    expect(res.body.title).to.eql(newArticle.title);
                    expect(res.body.style).to.eql(newArticle.style);
                    expect(res.body.content).to.eql(newArticle.content);
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/articles/${res.body.id}`)

                    //check the date was created properly by default
                    const expected = new Date().toLocaleDateString();
                    const actual = new Date(res.body.date_published).toLocaleDateString();
                    expect(actual).to.eql(expected);
                })
                .then(postRes => //here we are making a getById call to assure it's there.
                    supertest(app)
                        .get(`/api/articles/${postRes.body.id}`)
                        .expect(postRes.body)
                    );

        });//end of it


        it('responds with 422 and error message when any required field is missing', () => {
            //setup faulty article missing the "title" and "style"
            const newArticle = { content: 'This is my new article. Check it out and let me know what you think.'};
            return supertest(app)
                .post('/api/articles')
                .send(newArticle)
                .expect(422, {
                    error: 422,
                    message: "Missing following fields: 'title,style'"
                });

        });



    });//-------------------end of POST-----------------



    //========================= DELETE /articles/:articleId ===============================================
    describe('----------------------------------"DELETE /articles/:articleId"------------------------------', () => {

        context('(Given NO articles in the database)', () => {
            
            it('returns 404, no resource found', () => {
                const idToRemove = 2;
                return supertest(app)
                    .delete(`/api/articles/${idToRemove}`)
                    .expect(404, {
                        error: {code: 404, message: `Article does not exist! Whoops. Check the id.`}
                    })
                    
                    
            });//end of it

        });//end of context: w/data


        context('(Given there ARE articles in the database)', () => {
            //-------TEST SETUP------------
            //create some test articles to insert
            const testArticles = makeArticlesArray();

            //insert the test articles.
            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
                    // .returning('*')
                    // .then(articles => console.log(articles)); //<--only if we want to see that the data was inserted. commented out for now.
            });
       //----------TEST BEGIN------------------------

            it('Deletes an article and returns 204', () => {
                const idToRemove = 2;
                const expectedArticles = testArticles.filter(article => article.id !== idToRemove );
                return supertest(app)
                    .delete(`/api/articles/${idToRemove}`)
                    .expect(204)
                    .then(() => { //now getting all articles and checking if it's gone by expecting the articles to be missing #2
                        return supertest(app)
                        .get(`/api/articles/`)
                        .expect(expectedArticles)
                    })
                    .then(() => { //here we are making sure that a call that id will return a 404.
                        return supertest(app)
                        .get(`/api/articles/${idToRemove}`)
                        .expect(404, {
                            error: {code: 404, message: `Article does not exist! Whoops. Check the id.`}
                            });
                    });
            });//end of it

        });//end of context: w/data

    });//-------------------end of DELETE-----------------



});