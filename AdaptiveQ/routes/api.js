var express = require('express');
var router = express.Router();

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

function sendError(error){
    console.log(error);
    res.send({'status' : 'ERROR', 'eMessage' : error});
}

function sendOK(data){
    res.send({'status' : 'OK', 'data' : data});
}

//------- API functions --------//
router.post('/addQuestion', requireLogin, function(req, res){    
    var q = req.body;
    if( (isEmpty(q.text) && isEmpty(q.code)) || isEmpty(q.options) || isEmpty(q.answers) ){
        sendError('Empty question or not enough answers provided');
    }
    else if(!q.courseId || q.concepts.length == 0){
        sendError('Question must belong to a course and have at least one concept');
    }

    var course = Courses.getCourseById(q.courseId)
        .then(function (course){
            if(!checkIfInstructor(course, req.session.user._id)){
                sendError('User not instructor for course.');
            }
            else{
                Questions.addQuestion(q)
                .then(function (savedQuestion){
                    // TODO : Send email to students
                    sendOK(savedQuestion);
                }, function (error){ sendError(error); });
            }
        }, function (error){ sendError(error); });
});

router.get('/getCourseQuestions', requireLogin, function(req, res){
    var courseId = req.query._id;
    if (!courseId) { sendError('No CourseId given.');}
    else
    {
        Questions.getAllCourseQuestions(courseId)
            .then(function (questions){
                // Get user records. Delete answers if user has not attempted
                Users.getUserById(req.session.user._id)
                    .then(function (user){
                        for(var i = 0; i < questions.length; ++i){
                            var attempted = false;
                            for(var j = 0; j < user.records.length; ++j){
                                if(user.records[j].qId == questions[i]._id){
                                    attempted = true;
                                    break;
                                }
                            }
                            if (!attempted){
                                // TODO : test why delete statement doesnt work
                                questions[i].answers = [];
                            }
                        }
                        sendOK(questions);
                    }, function (error) {sendError(error);});
            }, function (error) {
                sendError(error);
            });
    }
});

router.get('/getCourseConcepts', requireLogin, function(req, res){
    var courseId = req.query.courseId;
    if (!courseId) { sendError('No CourseId given.');}
    else
    {
        Concepts.getCourseConcepts(courseId)
            .then(function(concepts){
                sendOK(concepts);
            }, function (error){sendError(error);})
    }
});

router.post('/addConcept', requireLogin, function(req, res, next){
    var concept = req.body;
    if(isEmpty(concept.name)){
        sendError('Cannot be empty');
    }
    else if(!concept.courseId){
        sendError('No course specified');
    }
    else{
        Courses.getCourseById(concept.courseId)
            .then(function (course){
                if(!checkIfInstructor(course, req.session.user._id)){
                    sendError('Not instructor of the course!');                  
                }
                else{
                    Concepts.getConceptByName(course._id, concept.name)
                        .then(function (existingConcept){
                            if (existingConcept != null || ! typeof existingConcept === "undefined"){
                                sendError('Concept already exists');
                            }
                            else{
                                Concepts.addConcept(course._id,concept.name)
                                    .then(function (savedConcept){
                                        sendOK(savedConcept);
                                     },function (error){ sendError(error) });
                            }
                        }, function (error){ sendError(error); });
                }
            }, function (error) {sendError(error);}
        );
    }
});

module.exports = router;
