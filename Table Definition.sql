
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
  ingredient_name nvarchar(255) NOT NULL UNIQUE
)
CREATE TABLE measurements (
  measurement_id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  measurement nvarchar(255) NOT NULL
)
CREATE TABLE recipes (
  recipe_id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
  user_id int NOT NULL FOREIGN KEY REFERENCES accounts(user_id),
  title nvarchar(255) NOT NULL,
  source nvarchar(255) NOT NULL,
  url nvarchar(2083) NOT NULL,
  image_url nvarchar(2083)
)
CREATE TABLE recipes_ingredients (
    reference_id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    recipe_id int NOT NULL FOREIGN KEY REFERENCES recipes(recipe_id),
    ingredient_id int NOT NULL FOREIGN KEY REFERENCES ingredients(ingredient_id),
    amount nvarchar(255) NOT NULL,
    measurement_id int FOREIGN KEY REFERENCES measurements(measurement_id),
    optional bit NOT NULL DEFAULT 0
)
CREATE TABLE inventory (
    inv_id int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id int NOT NULL FOREIGN KEY REFERENCES accounts(user_id),
    ingredient_id int NOT NULL FOREIGN KEY REFERENCES ingredients(ingredient_id),
    amount int NOT NULL,
    measurement_id int FOREIGN KEY REFERENCES measurements(measurement_id),
    image_url nvarchar(2083),
    expiry_date date NOT NULL
)

INSERT INTO accounts (username, password, email) VALUES ('EasyFood', 'EZ13454902', 'admin@easyfood.com');
INSERT INTO accounts (username, password, email) VALUES ('test', 'test', 'test@test.com');
INSERT INTO ingredients (ingredient_name) VALUES ('plain flour');
INSERT INTO ingredients (ingredient_name) VALUES ('large eggs');
INSERT INTO ingredients (ingredient_name) VALUES ('milk');
INSERT INTO ingredients (ingredient_name) VALUES ('vegetable oil');
INSERT INTO ingredients (ingredient_name) VALUES ('lemon wedges');
INSERT INTO ingredients (ingredient_name) VALUES ('caster sugar');
INSERT INTO measurements (measurement) VALUES ('none');
INSERT INTO measurements (measurement) VALUES ('g');
INSERT INTO measurements (measurement) VALUES ('ml');
INSERT INTO measurements (measurement) VALUES ('tbsp');
INSERT INTO recipes (user_id, title, source, url, image_url) VALUES (1, 'Easy Pancakes', 'BBC Good Food', 'https://www.bbcgoodfood.com/recipes/easy-pancakes', 'https://www.bbcgoodfood.com/sites/default/files/styles/recipe/public/recipe_images/recipe-image-legacy-id--1273477_8.jpg');
INSERT INTO recipes (user_id, title, source, url) VALUES (1, 'Example Recipe #2', 'Example Source', 'https://www.example.com/example');
INSERT INTO recipes (user_id, title, source, url) VALUES (2, 'Example Recipe #3', 'Example Source', 'https://www.example.com/example');
INSERT INTO recipes (user_id, title, source, url) VALUES (1, 'Example Recipe #4', 'Example Source', 'https://www.example.com/example');
INSERT INTO recipes (user_id, title, source, url) VALUES (2, 'Example Recipe #5', 'Example Source', 'https://www.example.com/example');
INSERT INTO recipes (user_id, title, source, url) VALUES (1, 'Example Recipe #6', 'Example Source', 'https://www.example.com/example');
INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount, measurement_id, optional) VALUES (1, 1, 100, 1, 0);
INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount, measurement_id, optional) VALUES (1, 2, 2, null, 0);
INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount, measurement_id, optional) VALUES (1, 3, 300, 2, 0);
INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount, measurement_id, optional) VALUES (1, 4, 1, 3, 0);
INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount, measurement_id, optional) VALUES (1, 5, 0, null, 1);
INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount, measurement_id, optional) VALUES (1, 6, 0, null, 1);
INSERT INTO inventory (user_id, ingredient_id, amount, measurement_id, image_url, expiry_date) VALUES (2, 1, 100, 2, 'https://groceries.morrisons.com/productImages/347/347483011_0_640x640.jpg', '2020-08-10');
INSERT INTO inventory (user_id, ingredient_id, amount, measurement_id, image_url, expiry_date) VALUES (2, 2, 2, 1, 'https://www.pecksfarmshop.co.uk/wp-content/uploads/2019/09/eggs.jpg', '2020-08-12');
