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
        if(user.courses[i]._id == courseId){
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
    // console.log(data);
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
                console.log("Email not found");
                res.send({'status' : 'ERROR', 'eMessage' : 'Email Not Found!'});
            }
            if(user.email){

                if(user.password == pass){
                    req.session.user = user;
                    delete req.session.user.records;
                    req.session.startTime = Date.now();

                    response = {'status':'OK'};
                    response.data = {};
                    response.data.user = {'id': user._id, 'email' : user.email, 'name': user.name, 'courses': user.courses};
                    if(user.email == "adaptq@gmail.com"){
                        req.session.isTeacher = true;
                        response.data.user.isInstructor = true;
                    }
                    else{
                        response.data.user.isInstructor = false;
                        if(req.session.redirect_to != null){
                            var url = req.session.redirect_to;
                            req.session.redirect_to = null;
                            console.log("redirecting to :"+url);
                            response.data.url = url;
                        }
                    }
                    res.send(response);
                }
                else {
                    console.log("Password mismatch");
                    res.send({'status' : 'ERROR', 'eMessage' : 'Incorrect password!'});
                }
            }
        },function(error){
			console.log("Database connectivity issue");
			res.send({'status' : 'ERROR', 'eMessage' : 'Incorrect password!'});
        });
});

router.post('/register', function(req, res){
    Users.getUserByEmail(req.body.email)
        .then(function (user){
            if(user && user.email){
                console.log("Found an existing user : " + user);
                res.send("Found an existing user with same email. Please use reset password link");
            }
            else{
                Users.createUser(req.body.email, req.body.password, req.body.name)
                    .then(function(savedUser){
                        req.session.user = savedUser;
                        if(savedUser.email != "adaptq@gmail.com"){
                            req.session.isTeacher = false;
                        }
                        else{
                            req.session.isTeacher = true;
                        }
                        req.session.startTime = Date.now();
                        res.send({status : 'OK'});
                    }, function (err){
                        console.log("Error in saving" + newUsers +"\n"+err);
                });
            }
        }, function(error){
        	console.log('Failed to search ' + error);
        });
});

router.post('/resetPassword', function(req, res){
    var userEmail = req.body.email;
    var password = req.body.password;
    var token = req.body.token;
    if(!token || !userEmail || !password){
        res.send({status: 'ERROR', eMessage: 'Required Parameters not provided'});
    }
    Users.getUserForToken(token)
        .then(function(user){
            if(user && userEmail == user.email){
                user.password = password;
                user.resetPasswordToken = "";
                user.save()
                    .then(function(user){
                        res.send({status: 'OK', message: 'Password succesfuly reset', url : '/'});
                    });
            }
            else{
                res.send({status: 'ERROR', eMessage: 'Invalid Token for emailId'});
            }
        }, function(error){
            console.log(error);
        });
});

router.post('/recover', function(req, res){
    Users.getUserByEmail(req.body.recoveryEmail)
        .then(function (user){
            if(!user){
                res.send({'status' : 'ERROR', 'eMessage' : 'No such email found'});
            }
            else{
                user.resetPasswordToken = randomstring.generate();
                user.save().then(function (savedUser){
                    console.log(savedUser.resetPasswordToken);
                    var url = localhost + "resetPaswword?token=" + savedUser.resetPasswordToken;
                    emailer.sendResetPasswordLink(sysAccount,user.email,url,function(error, message){
                        if(error){
                            console.log(error);
                            res.send({status : 'ERROR', eMessage : 'Error sending email'});
                        }
                        else{
                            console.log(message);
                            res.send({status : 'OK', message : 'Check registered email for link to reset'});
                        }
                    });

                });
            }
        }, function(err){
            console.log("No such email found");
        });
});

router.post('/postUserUpdate', requireLogin, function(req, res){
    var updatedUser = req.body;
    if(!updatedUser._id) { res.send(new respError('UserId cannot be empty'));}
    else{
        Users.getUserById(updatedUser._id)
        .then(function(user){
            if(updatedUser.name != user.name) { user.name = updatedUser.name; }
            if(updatedUser.email != user.email) { user.email = updatedUser.email; }
            if(updatedUser.password != user.password) { user.password = updatedUser.password; }
            enrolled_courseIds = [];
            for(var i = 0; i < updatedUser.courses.length; ++i){
                var enrolled = false;
                for(var j = 0; j < user.courses.length; ++j){
                    if (user.courses[j]._id == updatedUser.courses[i]._id){
                        enrolled = true;
                        enrolled_courseIds.push(user.courses[j]._id);
                        break;
                    }
                }
            }
            for(var j = 0; j < user.courses.length; ++j){
                if (enrolled_courseIds.indexOf(user.courses[j]._id) == -1){
                    delete user.courses[j];
                }
            }
            console.log(user);
            // Since user is a model object, check if mongoose can automatically dettect the updates
            user.save(function(savedUser){
                res.send(new respOK(savedUser));
            }, function (error){
                res.send(new respError(error));
            });
        })
    }
});

module.exports = router;
