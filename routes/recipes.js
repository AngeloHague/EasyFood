var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var sql = require('mssql');
var router = express.Router();

// Create a configuration object for our Azure SQL connection parameters
var dbConfig = {
 server: 'easyfood.database.windows.net', // Use your SQL server name
 database: 'EasyFood', // Database to connect to
 user: 'easyfood', // Use your username
 password: 't7M6RGQU5n7t', // Use your password
 port: 1433,
 //insecureAuth : true,
 // Since we're on Windows Azure, we need to set the following options
 options: {
       encrypt: true
   }
};

var app = express();
app.use(session({
	secret: 'w6yhEB3BWNsI',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

/* GET Recipes page. */
router.get('/', function(req, res, next) {
  res.render('recipes', { title: 'Recipes', loggedin: req.session.loggedin, recipes: req.session.recipes });
});

router.get('/find', function(req, res, next) {
  
});

router.get('/refresh', function(req, res, next) {
  updateRecipeStack(req,res, function(callback) {
    res.redirect('/recipes');
  });
});

function addIngredientToRecipe(recipe_id, ingredient_id, amount, measurement_id, callback) {
  var success = false;
  console.log('-- Call received --');
  console.log('recipe_id: ' + recipe_id);
  console.log('ingredient_id: ' + ingredient_id);
  console.log('amount: ' + amount);
  console.log('measurement_id: ' + measurement_id);

  if (recipe_id && ingredient_id && amount) {
    var conn = new sql.ConnectionPool(dbConfig);

	  conn.connect()
	  // Successfull connection
	  .then(function () {
      var query = 'INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount, measurement_id) VALUES (' + recipe_id + ',' + ingredient_id + ',' + amount + ',' + measurement_id + ')';
      console.log(query);
	    // Create request instance, passing in connection instance
	    var request = new sql.Request(conn);

	    // Call mssql's query method passing in params
	    request.query(query)
	    .then(function (recordset) {
        success = true;
        console.log ('Successfully added item');
        callback(success);
				conn.close();
	    })
	    // Handle sql statement execution errors
	    .catch(function (err) {
	      console.log(err);
	      conn.close();
	    })
	  })
	  // Handle connection errors
	  .catch(function (err) {
	    console.log(err);
	    conn.close();
	  });
  }
}

function addRecipeToDB(user_id, title, source, url, image_url, callback) {
  var recipe_id;

  console.log('-- Call received --');
  console.log('user_id: ' + user_id);
  console.log('source: ' + source);
  console.log('url: ' + url);
  console.log('image_url: ' + image_url);

  if (user_id && title && source && url) {

    var conn = new sql.ConnectionPool(dbConfig);

	  conn.connect()
	  // Successfull connection
	  .then(function () {
      var query = 'INSERT INTO recipes (user_id, title, source, url, image_url) OUTPUT Inserted.recipe_id VALUES (' + user_id + ', \'' + title + '\', \'' + source + '\', \'' + url + '\',\'' + image_url + '\')';
      console.log(query);
	    // Create request instance, passing in connection instance
	    var request = new sql.Request(conn);

	    // Call mssql's query method passing in params
	    request.query(query)
	    .then(function (recordset) {
        console.log(recordset.recordset[0]);
        console.log('Recipe Inserted');
        if (recordset.rowsAffected > 0) {
          console.log(recordset);
          recipe_id = recordset.recordset[0].recipe_id;
          conn.close();
          callback(recipe_id);
        }
        else {
          console.log('Doesn\'t return item insterted value');
          res.render('inventory', {response: 'Failed to get create measurement. Please try again'});
          conn.close();
        }
	    })
	    // Handle sql statement execution errors
	    .catch(function (err) {
	      console.log(err);
	      conn.close();
	    })
	  })
	  // Handle connection errors
	  .catch(function (err) {
	    console.log(err);
	    conn.close();
	  });
  }
}

function updateRecipeStack(req, res, callback) {
	getRecipesFromDb(req.session.user_id, req.session.username, function(recipes) {
  	console.log('Acquired recipes for User ID: ' + req.session.user_id);
  	//console.log(recipes);
  	req.session.recipes = recipes;
    callback(true);
  });
}

function getRecipesFromDb(user_id, username, callback) {

	var recipes = new Array();
  //pull all SQL entries from ivnentory table with user_id
  var conn = new sql.ConnectionPool(dbConfig);
  conn.connect()
  // Successfull connection
  .then(function () {

    // Create request instance, passing in connection instance
    var request = new sql.Request(conn);
		console.log(' -- Getting Recipes: ' + user_id + ', \"' + username + '\"');
    // Call mssql's query method passing in params
    request.query('SELECT * FROM recipes WHERE user_id = 1 OR user_id = ' + user_id)
    .then(function (recordset) {
			//console.log('Rows affected: ' + recordset.rowsAffected);
      if (recordset.rowsAffected > 0) {
				var i;
				for (i = 0; i < recordset.rowsAffected; i++) {
					recipes.push(recordset.recordset[i]);
					//console.log('Recipe (' + i + ') added to array:'); //DEBUG PURPOSES
					//console.log(recordset.recordset[i]); //DEBUG PURPOSES
				}
				console.log('Finished adding recipes to array.');
				//console.log(recipes);
      }
      callback(recipes);
      conn.close();
    })
    // Handle sql statement execution errors
    .catch(function (err) {
      console.log(err);
      conn.close();
    })
  })
  // Handle connection errors
  .catch(function (err) {
    console.log(err);
    conn.close();
  });
}



module.exports = {
  router:router,
  addIngredientToRecipe:addIngredientToRecipe,
  addRecipeToDB:addRecipeToDB,
  getRecipesFromDb:getRecipesFromDb,
  updateRecipeStack:updateRecipeStack
};
