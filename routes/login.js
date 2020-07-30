var express = require('express');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var sql = require('mssql');

var config = require('../core/SQL.js')
// Create connection instance
var conn = new sql.ConnectionPool(config);

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


/* GET login page. */
router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
    res.redirect('/account');
  }
  else
    res.render('login', { title: 'Login', account: 'Login / Register' });
});

router.post('/login', function(req, res) {
	var username = req.body.username;
	console.log(username);
	var password = req.body.password;
	console.log(password);
	// Attempt to connect and execute queries if connection goes through
	if (username && password) {
		var success = false;
	  var conn = new sql.ConnectionPool(dbConfig);

	  conn.connect()
	  // Successfull connection
	  .then(function () {

	    // Create request instance, passing in connection instance
	    var request = new sql.Request(conn);

	    // Call mssql's query method passing in params
	    request.query('SELECT * FROM accounts WHERE username LIKE \'' + username + '\' AND password LIKE \'' + password + '\'')
	    .then(function (recordset) {
	      console.log('Records: ' + recordset);
	      if (recordset.rowsAffected > 0) {
					req.session.loggedin = true;
   				req.session.username = username;
					//req.session.userID =
   				res.redirect('/home');
	      }
	      else
 				//res.send('Incorrect Username and/or Password!');
 				res.render('login', {response: 'Incorrect username and/or password.'});
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

module.exports = router;
