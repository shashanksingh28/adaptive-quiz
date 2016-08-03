var express = require('express');
var router = express.Router();

var localhost = "http://localhost:3000/";
var sysAccount = 'adaptq@gmail.com';

var Users = require('../models/user');
var Courses = require('../models/course');
var Concepts = require('../models/concept');
var Questions = require('../models/question');
var Logger = require('../models/log');

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
router.post('/log', requireLogin, function(req, res, next){
    var userId = req.session.user._id;
    var event_type = req.body.event_type;
    var object_type = req.body.object_type;
    var object_value = req.body.object_value;

    if(!event_type || !object_type){
        res.send(new respError("Event Type and Object Type needed"));
    }
    else{
        Logger.logAction(userId, event_type, object_type, object_value)
        .then(function (savedLog){
            res.send(new respOK(savedLog));
        });
    }
});

module.exports = router;
