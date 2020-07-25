var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var upload = multer();
var app = express();
var path = require('path');

app.get("/", function(req,res){
  res.render("form");
});

app.set("view engine", "pug");
app.set('views',path.join(__dirname + '/views'));

// for parsing application/json
app.use(bodyParser.json());

//for parsing application/xvww
app.use(bodyParser.urlencoded({extended: true}));
//form-urlencoded

//for parsding multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

app.post("/", function(req, res){
  console.log(req.body);
});

app.listen(7000);
