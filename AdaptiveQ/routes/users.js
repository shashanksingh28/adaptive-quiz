var express = require('express');
var router = express.Router();
var User = require('../models/userModel');

function getUser(email){
  var promise = User.findOne({'email':email}).exec();
  return promise;
}

function createUser(user){
  var promise = user.save();
  return promise;
}

router.post('/login', function(req, res){
    var email = req.body.email;
    var pass = req.body.password;
    //console.log(email);
    //console.log(pass);
    getUser(email)
    .then(function (user){
      console.log(user);
      console.log("user id is" + user._id);
      if(user.email){
        // check if password matches
        if(user.password == pass){
          req.session.email = email;
          req.session.userId = user._id
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

router.post('/register', function(req, res){
    //console.log(req.body);
    // check if the email already exists.
    //console.log(req.body.email);
    //console.log(req.body.password);

    getUser(req.body.email)
    .then(function (user){
      if(user && user.email){
        // TODO: redirect to error
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
        .then(function(savedUser){
            console.log("Saved: " + savedUser);
            req.session.email = savedUser.email;
            res.redirect('/question?id=1');
        }, function (err){
            console.log("Error in saving" + newUser +"\n"+err);
            // TODO redirect to error
        });
      }
    });
  });

module.exports = router;
