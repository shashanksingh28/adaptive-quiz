var express = require('express');
var router = express.Router();
var Concepts = require('../models/conceptModel');

router.get('/concepts', function(req, res, next){
  Concepts.getConceptTree(function (tree){
    res.send(tree);
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session && req.session.user){
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
  req.session.user = null;
  res.redirect('/');
});

module.exports = router;
