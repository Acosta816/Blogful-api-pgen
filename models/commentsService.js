//********************** [Articles Service MODEL] **********************************
//----(JUST sql queries to database provided)------

const CommentsService = {

    getAllComments(knexInstance) {
        return knexInstance.select('*').from('blogful_comments');
    },

    getCommentById(knexInstance, commentId) {
        return knexInstance.select('*').from('blogful_comments')
            .where({id: commentId})
            .first(); //returns just the object instead of the object in an [array].
    },

    insertComment(knexInstance, comment) {
        return knexInstance.insert(comment)
            .into('blogful_comments')
            .returning('*')
            .then(rows => {
                return rows[0] //returns just the object instead of the object inside an array.
            });
    },

    updateCommentById(knexInstance, commentId, newData) {
        return knexInstance('blogful_comments')
            .where({id: commentId})
            .update(newData);
    },

    deleteCommentById(knexInstance, commentId){
        return knexInstance('blogful_comments')
            .where({id: commentId})
            .delete();

    }


};

module.exports = CommentsService;