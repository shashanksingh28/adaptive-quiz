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

router.get('/', function(req, res) {
    if(req.session && req.session.user){
        Users.getUserById(req.session.user._id)
        .then(function(user){
            user = user.toObject();
            delete user.password;
            Courses.getAllCourses()
            .then(function (allCourses){
                if(req.session.redirect_qId){
                    var questionId = req.session.redirect_qId;
                    delete req.session.redirect_qId;
                    res.render('layout', { user_server : user, allCourses_server : allCourses, question_server : questionId });
                }
                else{
                    res.render('layout', { user_server : user, allCourses_server : allCourses, question_server : '' });
                }
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

// This is to provide an easier RESTFul way to directly access question page
// Can be sent over email
router.get('/question', function(req, res) {
    var questionId = req.query._id;
    if(!questionId){
        res.send(new respError('No questionId provided'));
    }
    else if(req.session && req.session.user){
        Users.getUserById(req.session.user._id)
        .then(function(user){
            user = user.toObject();
            delete user.password;
            Courses.getAllCourses()
            .then(function (allCourses){
                res.render('layout', { user_server : user, allCourses_server : allCourses, question_server : questionId });
            }, function (error){
                res.render('error', error);
            });
        }, function (error){
            res.render('error', error);
        });
    }
    else
    {
        // If user clicked on a url, store this to redirect automatically
        req.session.redirect_qId = questionId;
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
    res.render('partials/' + name);
});

module.exports = router;
