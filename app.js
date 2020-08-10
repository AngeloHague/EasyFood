var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sql = require('mssql');

var indexRouter = require('./routes/index');
var inventoryRouter = require('./routes/inventory');
var recipeRouter = require('./routes/recipes');
var usersRouter = require('./routes/users');

var app = express();
app.use(session({
	secret: 'w6yhEB3BWNsI',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/home', indexRouter);
app.use('/inventory', inventoryRouter.router);
app.use('/recipes', recipeRouter.router);
app.use('/users', usersRouter);

//Enable use of static files:
app.use('/img',express.static(path.join(__dirname, 'public/images')));
app.use('/js',express.static(path.join(__dirname, 'public/javascripts')));
app.use('/css',express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/fonts',express.static(path.join(__dirname, 'public/fonts')));

//Handle 'Add recipe' Form request
app.post('/recipes/add', function(req, res) {
	console.log(req.body);
	var recipeName = req.body.recipeName;
	var recipeSource = req.body.recipeSource;
	var recipeURL = req.body.recipeURL;
	var recipeImage = req.body.recipeImage;
	var itemName = req.body.itemName;
	var itemAmount = req.body.itemAmount;
	var itemMeasurement = req.body.itemMeasurement;
	if (itemName.length == itemAmount.length && itemAmount.length == itemMeasurement.length) {
		recipeRouter.addRecipeToDB(req.session.user_id, recipeName, recipeSource, recipeURL, recipeImage, function(recipe_id) {
			console.log('SUCCESS! Recipe added. Recipe ID: ' + recipe_id);

			function forLoopCallback(i) {
				inventoryRouter.getSetIngredientID(itemName[i], function(itemID) {
					console.log('We got the Ingredient: ' + itemID);
					inventoryRouter.getSetMeasurementID(itemMeasurement[i], function(measurementID) {
						console.log('We got the Measurement: ' + measurementID);
						recipeRouter.addIngredientToRecipe(recipe_id, itemID, req.body.itemAmount[i], measurementID, function(success) {
							if (success == true && i == itemName.length-1) {
								recipeRouter.updateRecipeStack(req,res, function(callback) {
									inventoryRouter.getInventoryFromDb(req.session.user_id, req.session.username, function(inventory) {
								  	console.log('Acquired inventory from function: ');
								  	console.log(inventory);
								  	req.session.inventory = inventory;
								  	res.render('recipes', { title: 'Recipes', loggedin: req.session.loggedin, recipes: req.session.recipes });
								  });
								});
							}
							else {
								res.render('recipes', {response: 'There was an issue adding this item. Please try again'});
							}
						});
					});
				});
			}

			for (var i=0;i<itemName.length;i++) {
				forLoopCallback(i);
			}
		});
	}
});

//Handle getIngredients Recipe Request
app.post('/recipe/getIngredients', function(req, res) {
	console.log('Use recipe request received'); //DEBUG purposes
	var conn = new sql.ConnectionPool(dbConfig);
	var recipe_id = req.body.recipe_id;
	var user_id = req.session.user_id;

	conn.connect()
	// Successfull connection
	.then(function () {
		//Build Query string from the array of inventory IDs
		console.log(recipe_id);
		var query = 'SELECT * FROM recipes_ingredients WHERE recipe_id LIKE ' + recipe_id;

		console.log(query);

		// Create request instance, passing in connection instance
		var request = new sql.Request(conn);

		// Call mssql's query method passing in params
		request.query(query)
		.then(function (recordset) {
			if (recordset.rowsAffected > 0) {
				for (rset in recordset.recordset) {

				}
				console.log('Item(s) removed');
				res.send(true);
				conn.close();
			}
		})
		// Handle sql statement execution errors
		.catch(function (err) {
			console.log(err);
			res.send(false);
			conn.close();
		})
	})
	// Handle connection errors
	.catch(function (err) {
		console.log(err);
		res.send(false);
		conn.close();
	});
});

//Handle 'Find recipe' Form request
app.post('/recipes/find', function(req, res) {
	console.log('Find request received'); //DEBUG purposes
	var conn = new sql.ConnectionPool(dbConfig);

	conn.connect()
	// Successfull connection
	.then(function () {
		//Build Query string from the array of inventory IDs
		console.log(req.body.ids);
		var query = 'SELECT recipe_id FROM recipes_ingredients WHERE ingredient_id IN ('
		var counter;
		for (counter = 0; counter < req.body.ids.length; counter++) {
			query = query + req.body.ids[counter];
			if (counter < req.body.ids.length-1)
				query = query + ','
			else if (counter == req.body.ids.length-1)
				query = query + ')'
		}

		console.log(query);

		// Create request instance, passing in connection instance
		var request = new sql.Request(conn);

		// Call mssql's query method passing in params
		request.query(query)
		.then(function (recordset) {
			var ids = new Array();
			console.log(recordset.recordset);
			for (var i = 0; i < recordset.rowsAffected; i++) {
				console.log(recordset.recordset[i]);
				console.log('Recipe found: '+ recordset.recordset[i].recipe_id);
				ids.push(recordset.recordset[i].recipe_id);
			}
			req.session.filterRecipes = ids;
			res.send(true);
			conn.close();
		})
		// Handle sql statement execution errors
		.catch(function (err) {
			console.log(err);
			res.send(false);
			conn.close();
		})
	})
	// Handle connection errors
	.catch(function (err) {
		console.log(err);
		res.send(false);
		conn.close();
	});
});

//Handle Remove Recipe Request
app.post('/recipe/remove', function(req, res) {
	console.log('Remove request received'); //DEBUG purposes
	var conn = new sql.ConnectionPool(dbConfig);

	conn.connect()
	// Successfull connection
	.then(function () {
		//Build Query string from the array of inventory IDs
		console.log(req.body.ids);
		var query = 'DELETE FROM recipes WHERE'
		var counter;
		for (counter = 0; counter < req.body.ids.length; counter++) {
			query = query + ' (inv_id = ' + req.body.ids[counter] + ' AND user_id = ' + req.session.user_id + ')';
			if (counter < req.body.ids.length-1)
				query = query + ' OR'
		}

		console.log(query);

		// Create request instance, passing in connection instance
		var request = new sql.Request(conn);

		// Call mssql's query method passing in params
		request.query(query)
		.then(function (recordset) {
			console.log('Item(s) removed');
			res.send(true);
			conn.close();
		})
		// Handle sql statement execution errors
		.catch(function (err) {
			console.log(err);
			res.send(false);
			conn.close();
		})
	})
	// Handle connection errors
	.catch(function (err) {
		console.log(err);
		res.send(false);
		conn.close();
	});
});

//Handle 'Add to inventory' Form request
app.post('/inventory/add', function(req, res) {
	var itemName = req.body.itemName;
	var amount = req.body.itemAmount;
	var measurement = req.body.itemMeasurement;
	var expirydate = req.body.itemExpiryDate;
	var imageURL = req.body.itemImage;
	var buttonType = req.body.itemButton;
	console.log('Item Name: ' + itemName);
	console.log('Amount: ' + amount);
	console.log('Measurement: ' + measurement);
	console.log('Expiry date: ' + expirydate);
	if (itemName && amount && expirydate) {
		inventoryRouter.getSetIngredientID(itemName, function(itemID) {
			console.log('We got the Ingredient: ' + itemID);
			inventoryRouter.getSetMeasurementID(measurement, function(measurementID) {
				console.log('We got the Measurement: ' + measurementID);
				inventoryRouter.addItemToInventory(req.session.user_id, itemID, amount, measurementID, imageURL, expirydate, function(success) {
					if (success == true) {
						inventoryRouter.updateInventory(req,res);
					}
					else {
						res.render('inventory', {response: 'There was an issue adding this item. Please try again'});
					}
				});
			});
		});
	}
});

//Handle 'Add to inventory' Form request
app.post('/inventory/edit', function(req, res) {
	var invID = req.body.invID;
	var itemName = req.body.itemName;
	var amount = req.body.itemAmount;
	var measurement = req.body.itemMeasurement;
	var expirydate = req.body.itemExpiryDate;
	var imageURL = req.body.itemImage;
	var buttonType = req.body.itemButton;
	console.log('Inv ID: ' + itemName);
	console.log('Item Name: ' + itemName);
	console.log('Amount: ' + amount);
	console.log('Measurement: ' + measurement);
	console.log('Expiry date: ' + expirydate);
	if (itemName && amount && expirydate) {
		inventoryRouter.getSetIngredientID(itemName, function(itemID) {
			console.log('We got the Ingredient: ' + itemID);
			inventoryRouter.getSetMeasurementID(measurement, function(measurementID) {
				console.log('We got the Measurement: ' + measurementID);
				inventoryRouter.editItemInInventory(invID, req.session.user_id, itemID, amount, measurementID, imageURL, expirydate, function(success) {
					if (success == true) {
						inventoryRouter.updateInventory(req,res);
					}
					else {
						res.render('inventory', {response: 'There was an issue adding this item. Please try again'});
					}
				});
			});
		});
	}
});

//Handle Remove Item Request
app.post('/inventory/remove', function(req, res) {
	console.log('Remove request received'); //DEBUG purposes
	var conn = new sql.ConnectionPool(dbConfig);

	conn.connect()
	// Successfull connection
	.then(function () {
		//Build Query string from the array of inventory IDs
		console.log(req.body.ids);
		var query = 'DELETE FROM inventory WHERE'
		var counter;
		for (counter = 0; counter < req.body.ids.length; counter++) {
			query = query + ' (inv_id = ' + req.body.ids[counter] + ' AND user_id = ' + req.session.user_id + ')';
			if (counter < req.body.ids.length-1)
				query = query + ' OR'
		}

		console.log(query);

		// Create request instance, passing in connection instance
		var request = new sql.Request(conn);

		// Call mssql's query method passing in params
		request.query(query)
		.then(function (recordset) {
			console.log('Item(s) removed');
			res.send(true);
			conn.close();
		})
		// Handle sql statement execution errors
		.catch(function (err) {
			console.log(err);
			res.send(false);
			conn.close();
		})
	})
	// Handle connection errors
	.catch(function (err) {
		console.log(err);
		res.send(false);
		conn.close();
	});
});

//Handle Login Form
app.post('/login', function(req, res) {

	var username = req.body.username;
	var password = req.body.password;
	// Attempt to connect and execute queries if connection goes through
	if (username && password) {
	  var conn = new sql.ConnectionPool(dbConfig);

	  conn.connect()
	  // Successfull connection
	  .then(function () {

	    // Create request instance, passing in connection instance
	    var request = new sql.Request(conn);

	    // Call mssql's query method passing in params
	    request.query('SELECT * FROM accounts WHERE username LIKE \'' + username + '\' AND password LIKE \'' + password + '\'')
	    .then(function (recordset) {
				console.log(recordset.recordset[0]);
	      if (recordset.rowsAffected > 0) {
					req.session.loggedin = true;
   				req.session.user_id = recordset.recordset[0].user_id;
   				req.session.username = username;
					recipeRouter.updateRecipeStack(req,res, function(callback) {
						inventoryRouter.updateInventory(req, res);
					});
	      }
	      else {
					//Reload page and inform user of incorrect login credentials:
	 				res.render('login', {response: 'Incorrect username and/or password.'});
				}
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
});

//Handle Sign up method
app.post('/signup', function(req, res) {
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var confirm = req.body.confirm;
	// Attempt to connect and execute queries if connection goes through
	if (username && password && confirm) {
	  var conn = new sql.ConnectionPool(dbConfig);

	  conn.connect()
	  // Successfull connection
	  .then(function () {

	    // Create request instance, passing in connection instance
	    var request = new sql.Request(conn);

	    // Call mssql's query method passing in params
	    request.query('SELECT * FROM accounts WHERE username LIKE \'' + username + '\'')
	    .then(function (recordset) {
	      console.log('Records: ' + recordset);
	      if (recordset.rowsAffected > 0) {
					//Account with that username already exists
	 				res.render('signup', {response: 'An account with that username already exists'});
		      conn.close();
	      }
	      else {
					request.query('SELECT * FROM accounts WHERE email LIKE \'' + email + '\'')
			    .then(function (recordset) {
			      console.log('Records: ' + recordset);
						if (recordset.rowsAffected > 0) {
							//Account with that email already exists
			 				res.render('signup', {response: 'An account with that email already exists'});
				      conn.close();
			      }
			      else {
							if (password != confirm) {
								//Passwords do not match
				 				res.render('signup', {response: 'Passwords do not match. Please try again'});
					      conn.close();
							}
							else {
								request.query('INSERT INTO accounts (username, password, email) VALUES (\'' + username + '\', \'' + password + '\', \'' + email + '\');')
						    .then(function (recordset) {
									console.log('Records ' + recordset);
									if (recordset.rowsAffected > 0) {
										console.log('Successful singup');
										//Ensures session data is clear for upcoming sign up
										req.session.loggedin = false;
					   				req.session.username = null;
										//Redirect user to login screen
					   				res.redirect('/login');
										conn.close();
									}
									else {
										//Error inserting data to SQL table
						 				res.render('signup', {response: 'Something went wrong on our end. Please wait and try again'});
							      conn.close();
									}
								})
						    // Handle sql statement execution errors
						    .catch(function (err) {
						      console.log(err);
						      conn.close();
						    });
							}
						}
					})
			    // Handle sql statement execution errors
			    .catch(function (err) {
			      console.log(err);
			      conn.close();
			    })
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
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
