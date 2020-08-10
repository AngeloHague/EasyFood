var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
    res.redirect('/inventory');
  }
  else
    res.render('index', { title: 'EasyFood', loggedin: req.session.loggedin, username: req.session.username });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  if (req.session.loggedin) {
    res.redirect('/account');
  }
  else
    res.render('login', { title: 'Login', loggedin: req.session.loggedin });
});

/* GET logout page. */
router.get('/logout', function(req, res, next) {
  if (req.session.loggedin) {
    req.session.destroy();
    console.log('User Session destroyed.');
    res.redirect('/home');
  }
  else
    res.redirect('/login');
});

/* GET Signup Page */
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign up', loggedin: req.session.loggedin });
});

/* GET Account page. */
router.get('/account', function(req, res, next) {
  if (!req.session.loggedin) {
    res.redirect('/login');
  }
  else
  res.render('account', { title: 'My Account', loggedin: req.session.loggedin, username: req.session.username });
});

function logToConsole(print){
  print.log('hello');
}

module.exports = router;
