var express = require('Express');
var app = express();

var things = require('./things.js');

//both router.js and things.jd should be in the same directory
app.use('/things', things);

app.listen(7000);
