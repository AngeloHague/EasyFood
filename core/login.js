var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var con = mysql.createConnection({
  host: "easyfood.database.windows.net",
  user: "easyfood",
  password: "Hibernate1",
	database : 'EasyFood',
  port : '1433',
  ssl: true
});

conn.connect(
	function (err) {
	if (err) {
		console.log("!!! Cannot connect !!! Error:");
		throw err;
	}
	else
	{
	   console.log("Connection established.");
           queryDatabase();
	}
});
