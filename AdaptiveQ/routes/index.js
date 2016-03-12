var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' , name : 'AdaptiveQ' });
});

router.post('/', function(req, res){
    var user = req.body.username;
    var pass = req.body.passwod;

    // TODO: Insert function here for user validation
    console.log(user+" : "+pass);
    //res.render('Question',{name: user});
    console.log(req.session);
    req.session.user = user;
    res.redirect('/question');
  });

module.exports = router;
