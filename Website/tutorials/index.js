const express = require('express');
const app = express();

const server = app.listen(7000, () => {
  console.log('Express running -> PORT ${server.address().port}');
});

app.get('/hello', (req, res) => {
  res.send('Hello World!!!');
});

app.post('/hello', function(req, res){
  res.send("You just called the post method at '/hello'!\n");
});

app.all('/test', function(req,res){
  res.send("HTTP method doesn't have any effect on this route!");
});
