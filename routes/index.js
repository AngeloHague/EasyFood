var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EasyFood' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login | EasyFood' });
});

/* GET login page. */
router.get('/inventory', function(req, res, next) {
  res.render('inventory', { title: 'Inventory | EasyFood' });
});

/* GET login page. */
router.get('/recipes', function(req, res, next) {
  res.render('recipes', { title: 'Recipes | EasyFood' });
});

module.exports = router;
