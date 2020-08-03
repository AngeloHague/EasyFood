var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EasyFood', loggedin: req.session.loggedin });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  if (req.session.loggedin) {
    res.redirect('/account');
  }
  else
    res.render('login', { title: 'Login', loggedin: req.session.loggedin });
});

/* GET Signup Page */
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign up', loggedin: req.session.loggedin });
});

/* GET Inventory page. */
router.get('/inventory', function(req, res, next) {
  console.log(req.session.inventory);
  res.render('inventory', { title: 'Inventory', loggedin: req.session.loggedin, inventory: req.session.inventory });
});

/* GET Recipes page. */
router.get('/recipes', function(req, res, next) {
  res.render('recipes', { title: 'Recipes', loggedin: req.session.loggedin });
});

/* GET Account page. */
router.get('/account', function(req, res, next) {
  if (!req.session.loggedin) {
    res.redirect('/login');
  }
  else
  res.render('account', { title: 'My Account', loggedin: req.session.loggedin });
});

function logToConsole(print){
  print.log('hello');
}

module.exports = router;
