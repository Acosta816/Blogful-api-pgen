--Summary: Create blogful_users table and alter articles table to add users FK column

--create blogful_users table...
CREATE TABLE blogful_users(
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    fullname TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT,
    nickname TEXT,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now()
);

--now alter the blogful_articles table to add users FK column
ALTER TABLE blogful_articles 
    ADD COLUMN 
        author INTEGER REFERENCES blogful_users(id)
        ON DELETE SET NULL; 

-- if the user is ever deleted, this FK will be set to null so the article can still exist. 