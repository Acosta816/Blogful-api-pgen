module.exports = {
    PORT: process.env.PORT || 8080,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_KEY_SECRET : process.env.JWT_KEY_SECRET,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://david@localhost/blogful',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://david@localhost/blogful-test'
}
