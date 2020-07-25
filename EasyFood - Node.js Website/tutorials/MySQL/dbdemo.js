var express = require('express');
var app = express();

var mysql = require("mysql");
var con = mysql.createConnection({
  host: "localhost",
  user: "nodejs",
  password: "password"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("ConnectedL");
});

app.listen(7000);
