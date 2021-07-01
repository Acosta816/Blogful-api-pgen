--this step alters the existing blogful_articles table to include a "style" column

--creating new data type called "article_category" which we will use to create the "style" column
CREATE TYPE article_category AS ENUM (
    'Listicle',
    'How-to',
    'News',
    'Interview',
    'Story'
);

ALTER TABLE blogful_articles
    ADD COLUMN 
    style article_category;