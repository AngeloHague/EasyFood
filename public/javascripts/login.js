var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var path = require('path');

var con = mysql.createConnection({
  host: "easyfood.database.windows.net",
  user: "easyfood",
  password: "Hibernate1"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
