var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();
// mongoose data models
var Question = require('../models/questionModel');

function getQuestion(id){
	var promise = Question.findById(id).exec();
	return promise;
}
//setup smtp for mailing
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "",
        pass: ""
    }
});

function createQuestion(question){
	var promise = question.save();
	return promise;
}

function attemptQuestion(userId,questionId){
	// check for answer and return null
}

// Give page to create question
router.get('/ask', function(req, res){
  	res.render('askquestion');
  });

// Show a question with given id
router.get('/', function(req, res){
	// check authentication before showing question
	if(!(req.session && req.session.user)){
		res.redirect('/');
	}

	getQuestion(req.param('id'))
	.then(function (question){
		res.render('question', {Question : question});
	})
	.catch(function (error){
		// TODO: error page
	});
});

// save new question
router.post('/ask', function(req, res){
	console.log(req.body);
	// TODO: add multiple options to questions
	var newQuestion = Question({
		text : req.body.question,
		options : [req.body.option1, req.body.option2, req.body.option3, req.body.option4],
		answer: 3,
		conceptId: 0,
		difficulty: 0
	});

		
	createQuestion(newQuestion)
	.then(function (err){
		if(err)	{
			// TODO: error page
		}
		console.log("Saved : "+newQuestion);		
		var mailOptions={
			from : "dhiraj92@gmail.com",
		   	to : "dhiraj92@gmail.com",
		   	subject : "Question of the day",
		  	text : newQuestion.text + " your question"
		}
		console.log(mailOptions);
		smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
		console.log(error);
		res.end("error");
		}else{
		console.log("Message sent: " + response.message);
		}
		});

		res.redirect('/question/ask');
	
		});
});



// Use below to populate sample questions
/*
var sampleQuestion = new Question({
	text:"What of the following is a default value of an instance variable?",
	options: ["null", "0", "Depends on type of variable", "Not Assigned"],
	answer: 2,
	conceptId: 0,
	difficulty: 0
});

sampleQuestion.save(function(err){
	if (err) throw err;

	console.log("Question Created!");
});
*/

module.exports = router;
