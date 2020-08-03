
--DROPPING TABLES:
DROP TABLE inventory
DROP TABLE recipes_ingredients
DROP TABLE recipes
DROP TABLE measurements
DROP TABLE ingredients
DROP TABLE accounts

--CREATING TABLES
CREATE TABLE accounts (
  user_id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  username nvarchar(30) UNIQUE NOT NULL,
  password nvarchar(100) NOT NULL,
  email nvarchar(255) NOT NULL
)
CREATE TABLE ingredients (
  ingredient_id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  ingredient_name nvarchar(255) NOT NULL UNIQUE,
  image_url nvarchar(255)
)
CREATE TABLE measurements (
  measurement_id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
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
    inv_id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id int NOT NULL FOREIGN KEY REFERENCES accounts(user_id),
    ingredient_id int NOT NULL FOREIGN KEY REFERENCES ingredients(ingredient_id),
    amount int NOT NULL,
    measurement_id int FOREIGN KEY REFERENCES measurements(measurement_id),
    expiry_date date NOT NULL
)

INSERT INTO accounts (username, password, email) VALUES ('admin', 'pass', 'admin@easyfood.com');
INSERT INTO accounts (username, password, email) VALUES ('test', 'test', 'test@test.com');
INSERT INTO ingredients (ingredient_name) VALUES ('plain flour');
INSERT INTO ingredients (ingredient_name) VALUES ('large eggs');
INSERT INTO ingredients (ingredient_name) VALUES ('milks');
INSERT INTO ingredients (ingredient_name) VALUES ('vegetable oil');
INSERT INTO ingredients (ingredient_name) VALUES ('lemon wedges');
INSERT INTO ingredients (ingredient_name) VALUES ('caster sugar');
INSERT INTO measurements (measurement) VALUES ('none');
INSERT INTO measurements (measurement) VALUES ('g');
INSERT INTO inventory (user_id, ingredient_id, amount, measurement_id, expiry_date) VALUES (2, 1, 100, 2, '2020-08-10');
INSERT INTO inventory (user_id, ingredient_id, amount, measurement_id, expiry_date) VALUES (2, 2, 2, 1, '2020-08-12');
