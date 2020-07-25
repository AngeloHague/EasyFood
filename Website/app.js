//Start express server:
var express = require('express');
var app = express();
var path = require('path');

//Enable use of static files:
app.use('/img',express.static(path.join(__dirname, 'public/images')));
app.use('/js',express.static(path.join(__dirname, 'public/javascript')));
app.use('/css',express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/fonts',express.static(path.join(__dirname, 'public/fonts')));

//Enable HTML rendering from 'views' folder using pug:
app.set('view engine', 'pug');
app.set('views',path.join(__dirname + '/views'));

app.get('/', function(req, res){
  res.render('home');
});

app.listen(7000);
