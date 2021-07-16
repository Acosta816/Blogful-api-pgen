//********************** [Users Service MODEL] **********************************
//----(JUST sql queries to database provided)------


//just a regular ol' Javascript object with some knex/sqlish logic for manipulating data. Mongoose did this behind the scenes for us with Models.
const UsersService = {

    //GET all currently existing users
    //accepts an established knex connection to a specific database.
    //---NOTE: This is just pure knex/sql logic being performed by the knex connection. Nothing else. Just a pure query.
    getAllUsers(knexInstance) {
         return knexInstance.select('*').from('blogful_users');
    },

    insertUser(knexInstance, newUser) {
        return knexInstance
            .insert(newUser)
            .into('blogful_users')
            .returning('*') //.insert() also supports returning the newly inserted item by using .returning() where we specify which columns we want to select. 
            .then(rows => {
                return rows[0]
            });
        },

    getUserById(knexInstance, itemId) {
        return knexInstance.from('blogful_users')
            .select('*')
            .where('id', itemId)
            .first();//this will return just the user object instead of an array with the single user object. Not a huge deal but nice touch for semantics, just cleaner.
    },

    deleteUserById(knexInstance, itemId) {
        return knexInstance('blogful_users')
            .where({id: itemId})
            .delete()
    },

    updateUserById(knexInstance, itemId, newData) {
        return knexInstance('blogful_users')
            .where({id: itemId})
            .update(newData)
    }
};

module.exports = UsersService;