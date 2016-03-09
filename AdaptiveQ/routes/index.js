var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' , name : 'AdaptiveQ' });
});

router.post('/', function(req, res){
  var user = req.body.username;
  console.log(user);
  //res.render('Question',{name: user});
  res.redirect('/Question');
  });


module.exports = router;
