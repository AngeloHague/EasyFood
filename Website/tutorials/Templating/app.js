var express = require('express');
var app = express();
var path = require('path');

app.set('view engine', 'pug');
app.set('views',path.join(__dirname + '/views'));

//Enable use of static files:
app.use('/img',express.static(path.join(__dirname, 'public/images')));
app.use('/js',express.static(path.join(__dirname, 'public/javascript')));
app.use('/css',express.static(path.join(__dirname, 'public/stylesheets')));

app.get('/first_template', function(req, res){
  res.render("first_view");
});

app.get('/dynamic_view', function(req, res){
  res.render('dynamic', {
    name: "TutorialsPoint",
    url: "http://www.tutorialspoint.com"
  });
});

app.get('/components', function(req, res){
  res.render('content');
});

app.get('/staticfiletest', function(req, res){
  res.render('staticfiletest');
});

app.listen(7000);
