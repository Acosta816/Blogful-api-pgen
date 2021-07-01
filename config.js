module.exports = {
    PORT: process.env.PORT || 8080,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_KEY_SECRET : process.env.JWT_KEY_SECRET,
    DB_URL: process.env.DB_URL || 'postgresql://david@localhost/blogful',
    TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://david@localhost/blogful-test'
}
