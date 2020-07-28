var express = require('express');
var session = require('express-session');
//var bodyParser = require('body-parser');
var path = require('path');

console.log('SQL node loaded');

//CONNECT TO AZURE SQL DATABASE:
var Connection = require('tedious').Connection;
var config = {
  server: 'easyfood.database.windows.net',  //update me
  authentication: {
    type: 'default',
    options: {
      userName: 'easyfood', //update me
      password: 'Hibernate1'  //update me
    }
  },
  options: {
    // If you are on Microsoft Azure, you need encryption:
    encrypt: true,
    database: 'EasyFood'  //update me
  }
};
var connection = new Connection(config);
connection.on('connect', function(err) {
  // If no error, then good to proceed.
  console.log("Connected");
});

module.exports.connection = connection;
module.exports.msg = "hello";

console.log('connection exported');
