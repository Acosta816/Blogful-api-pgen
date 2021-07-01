//********************** [Articles Service MODEL] **********************************
//----(JUST sql queries to database provided)------


//just a regular ol' Javascript object with some knex/sqlish logic for manipulating data. Mongoose did this behind the scenes for us with Models.
const ArticlesService = {

    //GET all currently existing articles
    //accepts an established knex connection to a specific database.
    //---NOTE: This is just pure knex/sql logic being performed by the knex connection. Nothing else. Just a pure query.
    getAllArticles(knexInstance) {
         return knexInstance.select('*').from('blogful_articles');
    },

    insertArticle(knexInstance, newItem) {
        return knexInstance
            .insert(newItem)
            .into('blogful_articles')
            .returning('*') //.insert() also supports returning the newly inserted item by using .returning() where we specify which columns we want to select. 
            .then(rows => {
                return rows[0]
            });
        },

    getArticleById(knexInstance, itemId) {
        return knexInstance.from('blogful_articles')
            .select('*')
            .where('id', itemId)
            .first();//this will return just the article object instead of an array with the single article object. Not a huge deal but nice touch for semantics, just cleaner.
    },

    deleteArticleById(knexInstance, itemId) {
        return knexInstance('blogful_articles')
            .where({id: itemId})
            .delete()
    },

    updateArticleById(knexInstance, itemId, newData) {
        return knexInstance('blogful_articles')
            .where({id: itemId})
            .update(newData)
    }
};

module.exports = ArticlesService;