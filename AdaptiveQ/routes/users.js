var express = require('express');
var router = express.Router();
var User = require('../models/userModel');

router.post('/login', function(req, res, next){
    var email = req.body.email;
    var pass = req.body.password;
    User.getUserByEmail(email)
    .then(function (user){
      if(user.email){
        if(user.password == pass){
          req.session.user = user;
          req.session.startTime = Date.now();
          if (user.email == "adaptq@gmail.com"){
            console.log("Teacher is here");
            req.session.isTeacher = true;
            res.redirect('/question/ask');
          }
          else{
            if(req.session.redirect_to != null){
              var url = req.session.redirect_to;
              req.session.redirect_to = null;
              res.redirect(url);
            }
            else {
              res.redirect('/');
            }
          }
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
    User.getUserByEmail(req.body.email)
    .then(function (user){
      if(user && user.email){
        // TODO: redirect to error
        console.log("Found an existing user : " + user);
      }
      else{
        User.createUser(req.body.email, req.body.password, req.body.username)
        .then(function(savedUser){
            console.log("Saved: " + savedUser);
            req.session.user = savedUser;
            res.redirect('/');
        }, function (err){
            console.log("Error in saving" + newUser +"\n"+err);
            // TODO redirect to error
        });
      }
    });
  });

module.exports = router;
