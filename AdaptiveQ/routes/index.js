var express = require('express');
var router = express.Router();

var Users = require('../models/user');
var Courses = require('../models/course');
var Concepts = require('../models/concept');
var Questions = require('../models/question');

var respOK = function(data){
    this.status = "OK";
    this.data = data;
}

var respError = function(error){
    console.log(error);
    this.status = "ERROR";
    this.eMessage = error;
}

router.get('/', function(req, res, next) {
    if(req.session && req.session.user){
        Users.getUserById(req.session.user._id)
        .then(function(user){
            delete user.password;
            Courses.getAllCourses()
            .then(function (allCourses){
                res.render('layout', { user_server : user, allCourses_server : allCourses });
            }, function (error){
                res.render('error', error);
            });
        }, function (error){
            res.render('error', error);
        });
    }
    else
    {
        res.render('login',{Message: ''});
    }
});

router.get('/resetPassword', function(req, res){
    var token = req.query.token;
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

router.get('/partials/:name', function (req, res){
    var name = req.params.name;
    // console.log('partials/' + name);
    res.render('partials/' + name);
});

module.exports = router;
