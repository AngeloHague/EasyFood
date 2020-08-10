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

/* GET Inventory page. */
router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
    var user_id = req.session.userid;
    var username = req.session.username;
  }
  res.render('inventory', { title: 'Inventory', loggedin: req.session.loggedin, inventory: req.session.inventory });
});

router.get('/refresh', function(req, res, next) {
  updateInventory(req,res);
});

function editItemInInventory(inv_id, user_id, ingredient_id, amount, measurement_id, image_url, expiry_date, callback) {
var success = false;
  console.log('-- Call received --');
  console.log('inv_id: ' + user_id);
  console.log('user_id: ' + user_id);
  console.log('ingredient_id: ' + ingredient_id);
  console.log('amount: ' + amount);
  console.log('measurement_id: ' + measurement_id);
  console.log('image_url: ' + image_url);
  console.log('expiry_date: ' + expiry_date);

  if (inv_id && user_id && ingredient_id && amount && expiry_date) {
    var query = 'UPDATE inventory SET ingredient_id = \'' + ingredient_id + '\', amount = ' + amount + ', measurement_id = ' + measurement_id + ', image_url = \'' + image_url + '\', expiry_date = \'' + expiry_date  + '\' WHERE (inv_id = ' + inv_id + ' AND user_id = ' + user_id + ')';
    console.log(query); //DEBUG purposes

    var conn = new sql.ConnectionPool(dbConfig);

	  conn.connect()
	  // Successfull connection
	  .then(function () {

	    // Create request instance, passing in connection instance
	    var request = new sql.Request(conn);

	    // Call mssql's query method passing in params
	    request.query(query)
	    .then(function (recordset) {
        success = true;
        console.log ('Successfully updated item');
        callback(success);
				conn.close();
	    })
	    // Handle sql statement execution errors
	    .catch(function (err) {
	      console.log(err);
        callback(success);
	      conn.close();
	    })
	  })
	  // Handle connection errors
	  .catch(function (err) {
	    console.log(err);
      callback(success);
	    conn.close();
	  });
  }
}

function addItemToInventory(user_id, ingredient_id, amount, measurement_id, image_url, expiry_date, callback) {
  var success = false;
  console.log('-- Call received --');
  console.log('user_id: ' + user_id);
  console.log('ingredient_id: ' + ingredient_id);
  console.log('amount: ' + amount);
  console.log('measurement_id: ' + measurement_id);
  console.log('image_url: ' + image_url);
  console.log('expiry_date: ' + expiry_date);

  if (user_id && ingredient_id && amount && expiry_date) {
    var conn = new sql.ConnectionPool(dbConfig);

	  conn.connect()
	  // Successfull connection
	  .then(function () {

	    // Create request instance, passing in connection instance
	    var request = new sql.Request(conn);

	    // Call mssql's query method passing in params
	    request.query('INSERT INTO inventory (user_id, ingredient_id, amount, measurement_id, image_url, expiry_date) VALUES (' + user_id + ',' + ingredient_id + ',' + amount + ',' + measurement_id + ',\'' + image_url + '\',\'' + expiry_date + '\')')
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

function getSetMeasurementID(measurement, callback) {

  var measurementID;
  if (measurement == null) {
    console.log('Empty measurement: returning null');
    measurementID = null;
    callback(measurementID);
  }
  else {
    var conn = new sql.ConnectionPool(dbConfig);

  	conn.connect()
  	// Successfull connection
  	.then(function () {
  		// Create request instance, passing in connection instance
  		var request = new sql.Request(conn);

  		// Call mssql's query method passing in params
  		request.query('SELECT * FROM measurements  WHERE measurement LIKE \'' + measurement + '\'')
  		.then(function (recordset) {
  			console.log(recordset.recordset[0]);
  			if (recordset.rowsAffected > 0) {
  				console.log('measurement already exists. Returning ID');
  				console.log(recordset);
  				measurementID = recordset.recordset[0].measurement_id;
  				conn.close();
  				callback(measurementID);
  			}
  			else {
  				console.log('Measurement doesnt already exist - creating');
  				request.query('INSERT INTO measurements (measurement) OUTPUT Inserted.measurement_id VALUES (\'' + measurement + '\')')
  				.then(function (recordset) {
  					console.log(recordset.recordset[0]);
  					console.log('measurement Inserted');
  					if (recordset.rowsAffected > 0) {
  						console.log(recordset);
  						measurementID = recordset.recordset[0].measurement_id;
  						conn.close();
  						callback(measurementID);
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

function getSetIngredientID(itemName, callback) {
	var conn = new sql.ConnectionPool(dbConfig);

	conn.connect()
	// Successfull connection
	.then(function () {

		// Create request instance, passing in connection instance
		var request = new sql.Request(conn);
		var itemID;

		// Call mssql's query method passing in params
		request.query('SELECT * FROM ingredients  WHERE ingredient_name LIKE \'' + itemName + '\'')
		.then(function (recordset) {
			console.log(recordset.recordset[0]);
			if (recordset.rowsAffected > 0) {
				console.log('Ingredient already exists. Returning ID');
				console.log(recordset);
				itemID = recordset.recordset[0].ingredient_id;
				conn.close();
				callback(itemID);
			}
			else {
				console.log('Ingredient doesnt already exist - creating');
				request.query('INSERT INTO ingredients (ingredient_name) OUTPUT Inserted.ingredient_id VALUES (\'' + itemName + '\')')
				.then(function (recordset) {
					console.log(recordset.recordset[0]);
					console.log('Item Inserted');
					if (recordset.rowsAffected > 0) {
						console.log(recordset);
						itemID = recordset.recordset[0].ingredient_id;
						conn.close();
						callback(itemID);
					}
					else {
						console.log('Doesn\'t return item insterted value');
            res.render('inventory', {response: 'Failed to get create item in database. Please try again'});
  					conn.close();
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

function updateInventory(req, res) {
	getInventoryFromDb(req.session.user_id, req.session.username, function(inventory) {
  	console.log('Acquired inventory from function: ');
  	console.log(inventory);
  	req.session.inventory = inventory;
  	res.redirect('/inventory');
  });
}

function getInventoryFromDb(user_id, username, callback) {

	var inventory = new Array();
  //pull all SQL entries from ivnentory table with user_id
  var conn = new sql.ConnectionPool(dbConfig);
  conn.connect()
  // Successfull connection
  .then(function () {

    // Create request instance, passing in connection instance
    var request = new sql.Request(conn);
		console.log(' -- Getting Inventory Data for User ID: ' + user_id + ', \"' + username + '\"');
    // Call mssql's query method passing in params
    request.query('SELECT inventory.inv_id, inventory.user_id, inventory.amount, inventory.measurement_id, inventory.image_url, inventory.expiry_date, ingredients.ingredient_id, ingredients.ingredient_name, measurements.measurement FROM ((ingredients INNER JOIN inventory ON inventory.ingredient_id=ingredients.ingredient_id) INNER JOIN measurements ON inventory.measurement_id=measurements.measurement_id) WHERE user_id = ' + user_id)
    .then(function (recordset) {
			console.log('Rows affected: ' + recordset.rowsAffected);
      if (recordset.rowsAffected > 0) {
				var i;
				for (i = 0; i < recordset.rowsAffected; i++) {
					inventory.push(recordset.recordset[i]);
					console.log('Record (' + i + ') added to inventory:');
					console.log(recordset.recordset[i]);
				}
				console.log('Finished adding records to inventory.');
				//console.log(inventory);
      }
      callback(inventory);
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
  getInventoryFromDb:getInventoryFromDb,
  getSetIngredientID:getSetIngredientID,
  getSetMeasurementID:getSetMeasurementID,
  addItemToInventory:addItemToInventory,
  editItemInInventory:editItemInInventory,
  updateInventory:updateInventory
};
