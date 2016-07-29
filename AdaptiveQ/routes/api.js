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
    console.log(data);
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
                        console.log(user);
                        for(var i = 0; i < questions.length; ++i){
                            console.log("testing question" + i);
                            var attempted = false;
                            for(var j = 0; j < user.attempts.length; ++j){
                                console.log("testing record index " + j);
                                if(user.attempts[j].qId == questions[i]._id){
                                    attempted = true;
                                    break;
                                }
                            }
                            console.log("checked records");
                            if (!attempted){
                                questions[i].answers = [];
                                console.log("deleted answers");
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

router.post('/addConcept', requireLogin, function(req, res){
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

router.post('/postAttempt', requireLogin, function(req, res){
    var questionId = req.body.questionId;
    var optionsSelected = req.body.optionsSelected;
    if (!questionId || !optionsSelected || optionsSelected.length == 0) { res.send(new respError("No questionId or no options provided")); }
    else{
        Users.getUserById(req.session.user._id)
        .then(function (user){
            Questions.getQuestionById(questionId)
            .then(function (question){
                if(!checkIfEnrolled(user, question.courseId)){
                    res.send(new respError("User not enrolled in course"));
                }
                Courses.getCourseById(question.courseId)
                .then(function (course){
                    if(checkIfInstructor(course, user._id)){
                        res.send(new respError("Instructor should not attempt"));
                    }
                    else{
                        // Score = No of correct answers given / (No of total correct + No of total incorrect)
                        var correctOptions = question.answers;
                        var correctCount = 0;
                        var incorrectCount = 0;
                        for(var i = 0; i < question.options.length; ++i){
                            if(correctOptions.indexOf(i) > -1){
                                // Check if user has given a correct answer
                                if(optionsSelected.indexOf(i) > -1){
                                    correctCount++;
                                }
                            }
                            else if(optionsSelected.indexOf(i) > -1){
                                incorrectCount++;
                            }
                        }
                        score = correctCount / (correctOptions.length + incorrectCount);
                        var attempt = {questionId : questionId, optionsSelected : optionsSelected, score: score, attempted_at: Date.now()};
                        Users.addAttemptToUserId(user._id,attempt)
                        .then(function (attempt){
                            // Append correct answers to object for client to show
                            attempt.answers = question.answers;
                            res.send(new respOK(attempt));
                            }, function(erorr){ res.send(new respError(error)); }
                        );
                    }
                });

            })


        })
    }

});

module.exports = router;