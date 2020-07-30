var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EasyFood', account: updateLoginButton(req) });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  if (req.session.loggedin) {
    res.redirect('/account');
  }
  else
    res.render('login', { title: 'Login', account: updateLoginButton(req) });
});

/*Get Signup Page*/
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign up', account: updateLoginButton(req) });
});

/* GET Inventory page. */
router.get('/inventory', function(req, res, next) {
  res.render('inventory', { title: 'Inventory', account: updateLoginButton(req) });
});

/* GET Recipes page. */
router.get('/recipes', function(req, res, next) {
  res.render('recipes', { title: 'Recipes', account: updateLoginButton(req) });
});

/* GET Account page. */
router.get('/account', function(req, res, next) {
  if (!req.session.loggedin) {
    res.redirect('/login');
  }
  else
  res.render('account', { title: 'My Account', account: updateLoginButton(req) });
});

function updateLoginButton(req) {
  console.log('Checking session info: ' + req.session.loggedin);
  if (req.session.loggedin) return 'My Account'
  else return 'Login / Register';
}

module.exports = router;
