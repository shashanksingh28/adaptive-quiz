var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session && req.session.userId){
      // show dashboard here
      res.render('dashboard');
    }
    else
    {
      res.render('login');
    }
});

router.get('/logout', function(req, res){
  req.session.userId = null;
  req.session.email = null;
  res.redirect('/');
});

router.get('/soup', function(req, res, next) {
 res.render('soup');
});

module.exports = router;
