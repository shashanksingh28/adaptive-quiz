var express = require('express');
var router = express.Router();
var User = require('../models/userModel');
//---- USER Functions ----- //
function getUser(email){
  var promise = User.findOne({'email':email}).exec();
  return promise;
}

function createUser(user){
  var promise = user.save();
  return promise;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' , name : 'AdaptiveQ' });
});

router.post('/', function(req, res){
    //console.log(req.body);
    var email = req.body.email;
    var pass = req.body.password;
    // TODO: Insert function here for user validation
    console.log(email);
    console.log(pass);
    getUser(email)
    .then(function (user){
      console.log(user);
      if(user.email){
        // check if password matches
        if(user.password == pass){
          req.session.email = email;
          res.redirect('/question?id=1');
        }
        else {
          // TODO password error
          console.log("Password mismatch");
          res.redirect('/');
        }
      }
      else {
        // TODO email error code
        console.log("Email not found");
        res.redirect('/');
      }
    });
  });

router.get('/register', function(req, res){
    res.render('register');
  });

router.post('/register', function(req, res){
    //console.log(req.body);
    // check if the email already exists.
    console.log(req.body.email);
    console.log(req.body.password);
    getUser(req.body.email)
    .then(function (user){
      if(user.email){
        // TODO: error page
        console.log("Found an existing user : " + user);
      }
      else{
        var newUser = User({
          email: req.body.email,
          password: req.body.password,
          name: req.body.username,
          records: []
      	});
        createUser(newUser)
        .then(function(error){
          if(error){
            // TODO Goto Error page
          }
          else {
            console.log("Saved: " + newUser);
          }
        });
      }
    });

    res.redirect('/question?id=1');
  });


router.get('/soup', function(req, res, next) {
 res.render('soup');
});

module.exports = router;
