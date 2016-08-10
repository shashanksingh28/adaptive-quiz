var express = require('express');
var router = express.Router();

var emailer = require('../helpers/emailer');
//var localhost = "http://52.40.100.41";
var localhost = "http://localhost:3000";
var sysAccount = 'adaptq@gmail.com';

var Users = require('../models/user');
var Courses = require('../models/course');
var Concepts = require('../models/concept');
var Questions = require('../models/question');
var Explanations = require('../models/explanation');
var Notes = require('../models/note');

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
    // console.log(data);
}

var respError = function(error){
    console.log(error);
    this.status = "ERROR";
    this.eMessage = error;
}

//------- Courses Section--------//
router.get('/getAllCourses', requireLogin, function(req, res){
    Courses.getAllCourses()
    .then(function (courses){
        res.send(new respOK(courses));
    }, function(error){
        res.send(new respError(error));
    });
});

router.get('/getCourseStudents', requireLogin, function(req, res){
    var courseId = req.query._id;
    if(courseId === null){ res.send(new respError('CourseID required')); }
    else{
        Courses.getCourseById(courseId)
        .then(function (course){
            if(!checkIfInstructor(course, req.session.user._id)){
                res.send(new respError('Not an instructor'));
            }
            else{
                Users.getCourseUsers(course._id)
                .then(function (users){
                    // remove user records not pertaining to the course
                    var students = [];
                    for(var i = 0; i < users.length; ++i){
                        var student = { _id : users[i]._id, name : users[i].name, attempts: []};
                        for(var j = 0; j < users[i].attempts.length; ++j){
                            if(users[i].attempts[j].courseId == courseId){
                                student.attempts.push(users[i].attempts[j]);
                            }
                        }
                        if(!checkIfInstructor(course, student._id)){
                            students.push(student);
                        }
                    }
                    res.send(new respOK(students));
                }, function(error)
                {
                    res.send(new respError(error));
                });
            }
        }, function(error){
            res.send(new respError(error));
        });
     }
});

// ------ Concepts Section -----//
router.get('/getCourseConcepts', requireLogin, function(req, res){
    var courseId = req.query._id;
    if (!courseId) { res.send(new respError('No CourseId given.'));}
    else
    {
        Concepts.getCourseConcepts(courseId)
        .then( function(concepts){
            res.send(new respOK(concepts));
            }, function (error) { res.send(new respError(error)); });
    }
});

router.post('/addConcept', requireLogin, function(req, res){
    var concept = req.body;
    if(isEmpty(concept.name)){
        res.send(new respError('Cannot be empty'));
    }
    else if(concept.courseId === null){
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
        }, function (error) { res.send(new respError(error)); });
    }
});

// ------- Question Section ------ //
router.post('/postQuestion', requireLogin, function(req, res){
    var q = req.body;
    if( (isEmpty(q.text) && isEmpty(q.code)) || isEmpty(q.options) || isEmpty(q.answers) ){
        res.send(new respError('Empty question or not enough answers provided'));
    }
    else if(q.courseId === null || q.concepts.length == 0){
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
                    Users.getCourseUsers(course._id)
                    .then(function(users){
                        userEmails = [];
                        for(var i = 0; i < users.length; ++i){
                            userEmails.push(users[i].email);
                        }
                        emailer.sendQuestion(localhost,sysAccount,null,userEmails,savedQuestion._id, savedQuestion.concepts,function(error, response){
                            if(error)
                            {
                    		    res.send(new respError("Error sending emails : " + error));
                    		}
            				res.send(new respOK(savedQuestion));
                    	});
                    });
                }, function (error){ res.send(new respError(error)); });
            }
        }, function (error){ res.send(new respError(error)); });
});

router.post('/postAttempt', requireLogin, function(req, res){
    var questionId = req.body.questionId;
    var optionsSelected = req.body.optionsSelected;
    if (!questionId || !optionsSelected || optionsSelected.length == 0) {
        res.send(new respError("No questionId or no options provided")); 
        return;
    }
    
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
                    var attempt = {questionId : questionId, courseId : question.courseId, optionsSelected : optionsSelected, score: score, attempted_at: Date.now()};
                    Users.addAttemptToUserId(user._id,attempt)
                    .then(function (attempt){
                        // Append correct answers to object for client to show
                        attempt.answers = question.answers;
                        res.send(new respOK(attempt));
                        }, function(error){ res.send(new respError(error)); }
                    );
                }
            });
        });
    });
});

router.get('/getCourseQuestions', requireLogin, function(req, res){
    var courseId = req.query._id;
    if (!courseId) { res.send(new respError('No CourseId given.')); }
    else
    {
        Questions.getAllCourseQuestions(courseId)
        .then(function (questions){
            Users.getUserById(req.session.user._id)
            .then(function (user){
                Courses.getCourseById(courseId)
                .then(function(course){
                    // If not an instructor and not attempted question, do not give answers
                    for(var i = 0; i < questions.length; ++i){
                        var attempted = false;
                        for(var j = 0; j < user.attempts.length; ++j){
                            if(user.attempts[j].questionId == questions[i]._id){
                                attempted = true;
                                break;
                            }
                        }
                        if (!attempted && !checkIfInstructor(course, req.session.user._id)){
                            questions[i].answers = [];
                        }
                    }
                    res.send(new respOK(questions));
                });
            }, function (error) {
                res.send(new respError(error));
            });
        }, function (error) {
            res.send(new respError(error));
        });
    }
});

// ------------ Explanations Section -------------- //
router.get('/getExplanations', requireLogin, function(req, res){
    console.log(req.query);
    var qId = req.query.questionId;
    if (!qId){
        res.send(new respError("No Question Id provided"));
        return;
    }
    Explanations.getExplanations(qId)
    .then(function(explanations){
        res.send(new respOK(explanations));
    }, function (error){
        res.send(new respError(error));
    });
});

router.post('/postExplanation', requireLogin, function(req, res){
    var qId = req.body.questionId;
    if (!qId){
        res.send(new respError("No Question Id provided"));
        return;
    }
    if(isEmpty(req.body.text)){
        res.send(new respError("No Question Id provided"));
        return;
    }
    Questions.getQuestionById(qId)
    .then(function (question){
        if(!question){
            res.send(new respError("No question with given questionId"));
            return;
        }
        
        Users.getUserById(req.session.user._id)
        .then(function (user){
            Explanations.addExplanation(question._id, user._id, user.name, req.body.text)
            .then(function(savedExplanation){
                res.send(new respOK(savedExplanation));
            }, function (error){
                res.send(new respError(error));
            })
        }, function(error){
            res.send(new respError(error));
        });
    }, function(error){
        res.send(new respError(error));
    });
});

router.post('/postUpvote', requireLogin, function(req, res){
    var expId = req.body._id;
    if(!expId){
        res.send(new respError("Explanation Id not given!"));
        return;
    }
    Explanations.getExplanationById(expId)
    .then(function(explanation){
        if (!explanation){
            res.send(new respError("No explanation with given Id"));
            return;
        }
        
        alreadyUpvoted = false;
        for(var i = 0; i < explanation.votes.length; ++i){
            if(explanation.votes[i] == req.session.user._id){
                alreadyUpvoted = true;
                break;
            }
        }
        if (!alreadyUpvoted){
            explanation.votes.push(req.session.user._id);
        }
        explanation.markModified('votes');
        explanation.save(function(error, savedExplanation){
            if(error){
                res.send(new respError(error));
                return;
            }
            res.send(new respOK(savedExplanation));
        });
    }, function(error){
        res.send(new respError(error));
    });
});

router.post('/postUnVote', requireLogin, function(req, res){
    var expId = req.body._id;
    if(!expId){
        res.send(new respError("Explanation Id not given!"));
        return;
    }
    Explanations.getExplanationById(expId)
    .then(function(explanation){
        if (!explanation){
            res.send(new respError("No explanation with given Id"));
            return;
        }

        index = -1;
        for(var i = 0; i < explanation.votes.length; ++i){
            if(explanation.votes[i] == req.session.user._id){
                index == i;
                break;
            }
        }
        if (index != -1){
            explanation.votes.splice(index, 1);
        }
        explanation.markModified('votes');
        explanation.save(function(error, savedExplanation){
            if(error){
                res.send(new respError(error));
                return;
            }
            res.send(new respOK(savedExplanation));
        });
    }, function(error){
        res.send(new respError(error));
    });
});

module.exports = router;
