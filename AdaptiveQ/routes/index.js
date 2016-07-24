var express = require('express');
var router = express.Router();
var Concepts = require('../models/concept');
var Users = require('../models/user');
var randomstring = require('randomstring');
var emailer = require('../helpers/emailer');
var localhost = "http://localhost:3000/";
var sysAccount = 'adaptq@gmail.com';

router.get('/concepts', function(req, res, next){
    Concepts.getConceptTree(function (tree){
        res.send(tree);
    });
});

function requireLogin (req, res, next) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
}

router.get('/', function(req, res, next) {
    if(req.session && req.session.user){
        Users.getUserById(req.session.user._id)
            .then(function(user){
                res.render('layout', user);
            }, function (error){
                res.send({'status': 'ERROR', 'eMessage': error });
            });
    }
    else
    {
        res.render('login',{Message: ''});
    }
});

router.get('/logout', function(req, res){
    req.session.reset();
    res.send({'status': 'OK'});
});

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
                Users.createUser(req.body.email, req.body.password, req.body.username)
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

router.get('/resetPaswword', function(req, res){
    var token = req.query.token;
    console.log(token);
    Users.getUserForToken(token)
        .then(function(user){
            if(user){
                res.render('pwrecovery',{userEmail: user.email, userToken: token});
            }
            else{
                res.send({status: 'ERROR', eMessage: 'Invalid Token'});
            }
        }, function(error){
            console.log(error);
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

router.get('/partials/:name', function (req, res){
    var name = req.params.name;
    console.log('partials/' + name);
    res.render('partials/' + name);
});

module.exports = router;
