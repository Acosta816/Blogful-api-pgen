--This undose the creation of our custom type called "article_category" 
--This removes the "style" column from blogful_articles table
--Note: need to alter the table before we remove the type

ALTER TABLE blogful_articles DROP COLUMN IF EXISTS style;

DROP TYPE IF EXISTS article_category;
