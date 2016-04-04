var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' , name : 'AdaptiveQ' });
});

router.get('/soup', function(req, res, next) {
 res.render('soup');
});

module.exports = router;
