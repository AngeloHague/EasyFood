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
 password: 'Hibernate1', // Use your password
 port: 1433,
 //insecureAuth : true,
 // Since we're on Windows Azure, we need to set the following options
 options: {
       encrypt: true
   }
};

var app = express();
app.use(session({
	secret: 'secret',
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

    //var array = getInventoryFromDb(req.session.loggedin);
  }
  res.render('inventory', { title: 'Inventory', loggedin: req.session.loggedin, inventory: req.session.inventory });
});

function getInventoryFromDb(user_id, username, callback) {
	//var user_id = req.session.user_id;
	//var username = req.session.username;
	var inventory = new Array();
  //pull all SQL entries from ivnentory table with user_id
  var conn = new sql.ConnectionPool(dbConfig);
	var inventory = new Array();
  conn.connect()
  // Successfull connection
  .then(function () {

    // Create request instance, passing in connection instance
    var request = new sql.Request(conn);
		console.log(' -- Getting Inventory Data for User ID: ' + user_id + ', \"' + username + '\"');
    // Call mssql's query method passing in params
    request.query('SELECT inventory.inv_id, inventory.user_id, inventory.amount, inventory.measurement_id, inventory.expiry_date, ingredients.ingredient_id, ingredients.ingredient_name, ingredients.image_url, measurements.measurement FROM ((ingredients INNER JOIN inventory ON inventory.ingredient_id=ingredients.ingredient_id) INNER JOIN measurements ON inventory.measurement_id=measurements.measurement_id) WHERE user_id = ' + user_id)
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
				callback(inventory);
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

function updateInventory(userInventory) {
  for (item in userInventory) {

  }
    //SQL query UPDATE inventory SET ... WHERE item.inv_id
    //Uses the inv_id column to ensure that the correct row is updated
}

//exports.getInventoryFromDb = getInventoryFromDb();
module.exports = {
  router:router,
  getInventoryFromDb:getInventoryFromDb
};
