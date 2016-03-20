var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' , name : 'AdaptiveQ' });
});

router.post('/', function(req, res){
    //console.log(req.body);
    var email = req.body.email;
    var pass = req.body.password;
    // TODO: Insert function here for user validation
    console.log(email+" : "+pass);
    //res.render('Question',{name: user});
    req.session.email = email;
    res.redirect('/question?id=1');
  });

router.get('/register', function(req, res){
    res.render('register');
  });

module.exports = router;
