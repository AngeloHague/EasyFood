var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sql = require('mssql');

var indexRouter = require('./routes/index');
//var loginRouter = require('./routes/login');
var usersRouter = require('./routes/users');

var app = express();
app.use(session({
	secret: 'secret',
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
 password: 'Hibernate1', // Use your password
 port: 1433,
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
app.use('/login', indexRouter);
app.use('/users', usersRouter);

//Enable use of static files:
app.use('/img',express.static(path.join(__dirname, 'public/images')));
app.use('/js',express.static(path.join(__dirname, 'public/javascripts')));
app.use('/css',express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/fonts',express.static(path.join(__dirname, 'public/fonts')));


//Handle Login Form
app.post('/login', function(req, res) {
	var username = req.body.username;
	console.log(username);
	var password = req.body.password;
	console.log(password);
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
	      console.log('Records: ' + recordset);
	      if (recordset.rowsAffected > 0) {
					req.session.loggedin = true;
   				req.session.username = username;
					//req.session.userID =
   				res.redirect('/home');
					conn.closer();
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

//Handle Sign up method
app.post('/signup', function(req, res) {
	var username = req.body.username;
	console.log(username);
	var email = req.body.email;
	console.log(email);
	var password = req.body.password;
	console.log(password);
	var confirm = req.body.confirm;
	console.log(confirm);
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
