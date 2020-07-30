##CREATING TABLES

CREATE TABLE accounts (
  user_id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  username nvarchar(30) NOT NULL,
  password nvarchar(100) NOT NULL,
  email nvarchar(255) NOT NULL
)

CREATE TABLE ingredients (
  ingredient_id int NOT NULL PRIMARY KEY,
  ingredient_name nvarchar(255) NOT NULL
)

CREATE TABLE measurements (
  measurement_id int NOT NULL PRIMARY KEY,
  measurement nvarchar(255) NOT NULL
)

CREATE TABLE recipes (
    recipe_id int NOT NULL PRIMARY KEY,
    user_id int NOT NULL FOREIGN KEY REFERENCES accounts(user_id),
    title nvarchar(255) NOT NULL,
    source nvarchar(255) NOT NULL,
    url nvarchar(2083) NOT NULL
)

CREATE TABLE recipes_ingredients (
    recipe_id int NOT NULL FOREIGN KEY REFERENCES recipes(recipe_id),
    ingredient_id int NOT NULL FOREIGN KEY REFERENCES ingredients(ingredient_id),
    amount nvarchar(255) NOT NULL,
    measurement_id int NOT NULL FOREIGN KEY REFERENCES measurements(measurement_id),
    options bit NOT NULL DEFAULT 0
)

CREATE TABLE inventory (
    user_id int NOT NULL FOREIGN KEY REFERENCES accounts(user_id),
    ingredient_id int NOT NULL FOREIGN KEY REFERENCES ingredients(ingredient_id),
    image_url nvarchar(255) NOT NULL,
    amount int NOT NULL,
    measurement_id int NOT NULL FOREIGN KEY REFERENCES measurements(measurement_id),
    expiry_date date NOT NULL
)

##DROPPING TABLES:

DROP TABLE inventory
DROP TABLE recipes_ingredients
DROP TABLE recipes
DROP TABLE measurements
DROP TABLE ingredients
DROP TABLE accounts
