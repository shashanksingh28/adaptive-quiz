var express = require('express');
var router = express.Router();
var randomstring = require('randomstring');
var emailer = require('../helpers/emailer');
var localhost = "http://localhost:3000/";
var sysAccount = 'adaptq@gmail.com';

var Users = require('../models/user');
var Courses = require('../models/course');
var Concepts = require('../models/concept');
var Questions = require('../models/question');

//------- Helper Functions --------//
function requireLogin (req, res, next) {
    if (!req.session.user) {
        res.send({'status': 'ERROR', eMessage: 'Not signed in! Sign in first.'});
    } else {
        next();
    }
}

function isEmpty(str){
    return (!str || str.length === 0);
}

function checkIfEnrolled(user, courseId){
    var isEnrolled = false;
    for(var i = 0; i < user.courses.length; ++i){
        if(user.courses[i] == courseId){
            isEnrolled = true;
            break;
        }
    }
    return isEnrolled;
}

function checkIfInstructor(course, userId){
    var isInstructor = false;
    for(var i = 0; i < course.instructorIds.length; ++i){
        if(course.instructorIds[i] == userId){
            isInstructor = true;
            break;
        }
    }
    return isInstructor;
}

var respOK = function(data){
    this.status = "OK";
    this.data = data;
}

var respError = function(error){
    console.log(error);
    this.status = "ERROR";
    this.eMessage = error;
}

//------- API functions --------//
router.post('/login', function(req, res, next){
    var email = req.body.email;
    var pass = req.body.password;
    Users.getUserByEmail(email)
        .then(function (user){
            if(!user){
                res.send( new respError('Email not found!'));
            }
            if(user.email){
                if(user.password == pass){
                    req.session.user = user.toObject();
                    delete req.session.user.records;
                    delete req.session.user.password;
                    req.session.startTime = Date.now();
                    data = {};
                    data.user = {'id': user._id, 'email' : user.email, 'name': user.name, 'courses': user.courses};
                    if(req.session.redirect_to != null){
                        var url = req.session.redirect_to;
                        req.session.redirect_to = null;
                        data.url = url;
                    }
                    res.send(new respOK(data));
                }
                else {
                    res.send(new respError('Incorrect Password!'));
                }
            }
        },function(error){
			res.send(new respError('Database connectivity issue'));
        });
});

router.post('/register', function(req, res){
    Users.getUserByEmail(req.body.email)
        .then(function (user){
            if(user && user.email){
                res.send(new respError("Found an existing user with same email. Please use reset password link"));
            }
            else{
                Users.createUser(req.body.email, req.body.password, req.body.name)
                    .then(function(savedUser){
                        delete savedUser.password;
                        req.session.user = savedUser;
                        req.session.startTime = Date.now();
                        res.send(new respOK(savedUser));
                    }, function (err){
                        res.send(new respError(error));
                });
            }
        }, function(error){
        	res.send(new respError(error));
        });
});

router.post('/resetPassword', function(req, res){
    var userEmail = req.body.email;
    var password = req.body.password;
    var token = req.body.token;
    if(!token || !userEmail || !password){
        res.send(new respError('Required Parameters not provided : token, email or new password'));
    }
    Users.getUserForToken(token)
        .then(function(user){
            if(user && userEmail == user.email){
                user.password = password;
                user.resetPasswordToken = "";
                user.save()
                .then(function(user){
                    res.send(new respOK('Password succesfuly reset'));
                });
            }
            else{
                res.send(new respError('Invalid Token for emailId'));
            }
        }, function(error){
            res.send(new respError(error));
        });
});

router.post('/recover', function(req, res){
    Users.getUserByEmail(req.body.recoveryEmail)
        .then(function (user){
            if(!user){
                res.send(new respError('No such email found'));
            }
            else{
                user.resetPasswordToken = randomstring.generate();
                user.save().then(function (savedUser){
                    console.log(savedUser.resetPasswordToken);
                    var url = localhost + "resetPassword?token=" + savedUser.resetPasswordToken;
                    emailer.sendResetPasswordLink(sysAccount,user.email,url,function(error, message){
                        if(error){
                            res.send(new respError('Error sending email'));
                        }
                        else{
                            res.send(new respOK('Check registered email for link to reset'));
                        }
                    });

                });
            }
        }, function(err){
            res.send(new respError(err));
        });
});

router.post('/postUserUpdate', requireLogin, function(req, res){
    var updatedUser = req.body;
    console.log(updatedUser);
    if(updatedUser._id === null) { res.send(new respError('UserId cannot be empty'));}
    else{
        Users.getUserById(updatedUser._id)
        .then(function(user){
            if(updatedUser.name != user.name) { user.name = updatedUser.name; }
            if(updatedUser.email != user.email) { user.email = updatedUser.email; }
            if(updatedUser.password && updatedUser.password != user.password) { user.password = updatedUser.password; }
            // this loop adds newer courses that user might have enrolled to
            for(var i = 0; i < updatedUser.courses.length; ++i){
                if(!checkIfEnrolled(user, updatedUser.courses[i])){
                    user.courses.push(updatedUser.courses[i]);
                }
            }
            // this loop removes courses that user might have un-enrolled to
            for(var i = 0; i < user.courses.length; ++i){
                if (!checkIfEnrolled(updatedUser, user.courses[i])){
                    delete user.courses[i];
                }
            }
            user.markModified('courses');
            user.save(function(error, savedUser){
                if(error){
                    res.send(new respError(error));
                }
                else{
                    savedUser = savedUser.toObject();
                    delete savedUser.password;
                    res.send(new respOK(savedUser));
                }
            });
        });
    }
});

router.get('/logout', function(req, res){
    req.session.reset();
    res.send({'status': 'OK'});
});

module.exports = router;
