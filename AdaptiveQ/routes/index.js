var express = require('express');
var router = express.Router();
var Concepts = require('../models/conceptModel');
var User = require('../models/userModel');

router.get('/concepts', function(req, res, next){
  Concepts.getConceptTree(function (tree){
    res.send(tree);
  });
});

function getMean(){

}
/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session && req.session.user){
      // show dashboard here
      //MeanData = getMean();
      res.render('dashboard');
    }
    else
    {
      res.render('login');
    }
});

router.get('/mean', function(req, res, next) {
    if(req.session && req.session.user){
      // show dashboard here
      console.log(req.session.user._id);
    User.getUserById(req.session.user._id)
    .then(function(users){

      MeanData = users;
      console.log(MeanData);
      res.send({mean:MeanData});

      },function (err){
          console.log("error in update explaination" + err);
        });


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
