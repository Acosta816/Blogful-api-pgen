--UNDO blogful_users create table migration

--go in reverse. Drop author column
ALTER TABLE blogful_articles
    DROP COLUMN author;

--now drop blogful_users table
DROP TABLE IF EXISTS blogful_users;