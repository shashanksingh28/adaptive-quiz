var mongo = require('mongoose');
var db_creds = require('./db_creds.json');
mongo.connect("52.10.54.229/adaptq_dev",{user: db_creds.user, pass: db_creds.pwd});

var Questions = require('./models/question');
var Courses = require('./models/course');
var Users = require('./models/user');

var emailer = require('./helpers/emailer');
var localhost = "http://localhost:3000";
var sysAccount = 'adaptq@gmail.com';

function sendUpdate(){
    Courses.getAllCourses()
    .then(function (courses){
        
        // For each course
        for(var i = 0; i < courses.length; ++i){
            // Get all unpublished questions
            Questions.getCourseUnpublished(courses[i]._id)
            .then(function (unPubQuestions){
                var courseId;

                // Most of the times, we won't have anything to publish                    
                if (!unPubQuestions || unPubQuestions.length == 0){
                    return;
                }
                else{
                    courseId = unPubQuestions[0].courseId;
                }
                // Get the users for the course
                Users.getCourseUsers(courseId)
                .then(function(users){
                    var userEmails = [];
                    for(var i = 0; i < users.length; ++i){
                        userEmails.push(users[i].email);
                    }
                    
                    for(var j = 0; j < unPubQuestions.length; ++j){
                        unPubQuestions[j].published = true;
                        emailer.sendQuestion(localhost,sysAccount,null,userEmails, unPubQuestions[j]._id, unPubQuestions[j].concepts, function(error, response){
                            if(error)
                            {
                                console.log("Error sending emails : " + error);
                            }
                        });
                        unPubQuestions[j].save(function(error, savedQuestion){
                            console.log(savedQuestion);
                        });
                    }
                });
           });
       }

    }, function (error){
        console.log(error);
    });
}

setInterval(sendUpdate, 2000);
