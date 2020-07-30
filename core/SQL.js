var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var sql = require('mssql');

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

module.export = dbConfig;
