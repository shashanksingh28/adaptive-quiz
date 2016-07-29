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
router.post('/addQuestion', requireLogin, function(req, res){    
    var q = req.body;
    if( (isEmpty(q.text) && isEmpty(q.code)) || isEmpty(q.options) || isEmpty(q.answers) ){
        res.send(new respError('Empty question or not enough answers provided'));
    }
    else if(!q.courseId || q.concepts.length == 0){
        res.send(new respError('Question must belong to a course and have at least one concept'));
    }

    var course = Courses.getCourseById(q.courseId)
        .then(function (course){
            if(!checkIfInstructor(course, req.session.user._id)){
                res.send(new respError('User not instructor for course.'));
            }
            else{
                Questions.addQuestion(q)
                .then(function (savedQuestion){
                    // TODO : Send email to students
                    res.send(new respOK(savedQuestion));
                }, function (error){ res.send(new respError(error)); });
            }
        }, function (error){ res.send(new respError(error)); });
});

router.get('/getCourseQuestions', requireLogin, function(req, res){
    var courseId = req.query._id;
    if (!courseId) { res.send(new respError('No CourseId given.')); }
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
                                questions[i].answers = [];
                            }
                        }
                        res.send(new respOK(questions));
                    }, function (error) {
                        res.send(new respError(error));
                    });
            }, function (error) {
                res.send(new respError(error));
            });
    }
});

router.get('/getCourseConcepts', requireLogin, function(req, res){
    var courseId = req.query._id;
    if (!courseId) { res.send(new respError('No CourseId given.'));}
    else
    {
        Concepts.getCourseConcepts(courseId)
            .then( function(concepts){
                console.log(concepts);
                res.send(new respOK(concepts));
                }, function (error) { res.send(new respError(error)); });
    }
});

router.post('/addConcept', requireLogin, function(req, res, next){
    var concept = req.body;
    if(isEmpty(concept.name)){
        res.send(new respError('Cannot be empty'));
    }
    else if(!concept.courseId){
        res.send(new respError('No course specified'));
    }
    else{
        Courses.getCourseById(concept.courseId)
            .then(function (course){
                if(!checkIfInstructor(course, req.session.user._id)){
                    res.send(new respError('Not instructor of the course!')); 
                }
                else{
                    Concepts.getConceptByName(course._id, concept.name)
                        .then(function (existingConcept){
                            if (existingConcept != null || ! typeof existingConcept === "undefined"){
                                res.send(new respError('Concept already exists'));
                            }
                            else{
                                Concepts.addConcept(course._id,concept.name)
                                    .then(function (savedConcept){
                                        sendOK(savedConcept);
                                     },function (error){ res.send(new respError(error)); });
                            }
                        }, function (error){ res.send(new respError(error)); });
                }
            }, function (error) { res.send(new respError(error));}
        );
    }
});

module.exports = router;
