var express = require('express');
var router = express.Router();

// Models to be used
var Users = require('../models/user');
var Courses = require('../models/courses');
var Concepts = require('../models/concepts');
var Questions = require('../models/questions');

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

router.post('/addquestion', requireLogin, function(req, res, next){    
    var q = req.body;
    if((isEmpty(q.question) && isEmpty(q.code)) || isEmpty(q.options) || isEmpty(q.answers)){
        res.send({ 'status' : 'ERROR', 'eMessage' : 'Empty question or not enough answers provided' });
    }
    else if(!q.course || q.concepts.len == 0){
        res.send({'status' : 'ERROR', 'eMessage' : 'Question must belong to a course and have at least one concept'});
    }

    var course = Courses.getUserById
        .then(function (course){
            var isInstructor = false;
            for(var i = 0; i < course.instructorIds.length; ++i){
                if(course.instructorIds[i] == req.session.user._id){
                    isInstructor = true;
                    break;
                }
            }
            if(!isInstructor){
                res.send({'status' : 'ERROR', 'eMessage' : 'User not instructor for course!'});
            }
            else{
                Questions.addQuestion(q)
                .then(function (savedQuestion){
                    // TODO : Send email to students
                    res.send({'status' : 'OK'});
                }, function (error){
                    res.send({'status': 'ERROR', 'eMessage' : error});
                });
            }
        }, function (error){
            res.send({'status': 'ERROR', 'eMessage' : error});
        });

});

router.post('/addconcept', requireLogin, function(req, res, next){
    
});
