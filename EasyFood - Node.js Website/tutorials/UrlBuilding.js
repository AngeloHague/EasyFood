var express = require('express');
var app = express();

//gets define parameters from URL
app.get('/things/:name/:id', function(req, res){
  res.send('Id: ' + req.params.id + ' and Name: ' + req.params.name);
});

//Patter Matched Routes (e.g. 5 digit number only)
app.get('/things/:id([0-9]{5})', function(req, res){
  res.send('id: ' + req.params.id);
});

//Other routes go here
app.get('*', function(req, res){
  res.send('Sorry, this is an invalid URL.');
});

app.listen(7000);
