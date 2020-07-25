var express = require('express');
var app = express();

//Simple request time logger
app.use('/things', function(req, res, next){
  console.log("A new request for things received at " + Date.now());
  //This function call is very important/ It tells that more processing required for the current request and is in the next middleware function/route handler.
  next();
});

//Route handler that sends the response
app.get('/things', function(req, res){
  res.send('Things');
});

app.use(function(req, res, next){
  console.log("Start");
  next();
});

app.get('/', function(req, res, next){
  res.send("Middle");
  next();
})

app.use('/', function(req, res){
  console.log('End');
});

//THIRD PARTY MIDDLEWARE
//  body-parser
//var bodyParser = require('body-parser');
//To parse URL encoded data
//app.use(bodyParser.urlencoded({extender: false}))
//To parse json data
//app.use(bodyParser.json())

//  cookie-parser
//var cookieParser = require('cookie-parser');
//app.use(cookieParser())

app.listen(7000);
