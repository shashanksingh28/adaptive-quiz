var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();
// mongoose data models
var Question = require('../models/questionModel');
var Users = require('../models/userModel');
function getQuestion(id){
	var promise = Question.findById(id).exec();
	return promise;
}
//setup smtp for mailing
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "adapt.q",
        pass: "quizoftheday"
    }
});

function createQuestion(question){
	var promise = question.save();
	return promise;
}
function updateQuestion(explaination,qid) {
	console.log("explaination is " + explaination);
	console.log("question id is" + qid);
	var promise = Question.update({'_id': qid},
		{$push:{'explainations':explaination}}).exec();
	return promise;
}
function updateUser(user,record){
	console.log("User is " + user)
	var promise = Users.update({'email': user},
		{$push:{'records':record}}).exec();
	return promise;
}

function attemptQuestion(questionId,givenAns,req,res){
	// check for answer and return null
	getQuestion(questionId).then(function (question){
		record = {
			qid : questionId,
			attempt : false
		}
		console.log("explaination is" + req.body.explainationGiven)
		explaination = {
			givenBy : req.session.userId,
			text : req.body.explainationGiven,
			noUpVotes: 0,
			upVotedBy: []

		}
		console.log(question);
		console.log("the question id is" + questionId);
		var correctAns = question.options[question.answer];
		console.log(correctAns);
		if (question.answer == givenAns )
		{
			record.attempt=true
			console.log("sahi javab");
		}
		else
		{
			console.log("galat javab");
		}
		console.log(req.session.email,record);
		updateUser(req.session.email,record)
		.then(function (updatedUser){
			console.log("Attempt Recorded:"+updatedUser);
			// TODO: Show user the right answer, his answer and explaination
			//res.send("Attempt Recorded!");
		},function (err){
				console.log("error in update");
				//TODO: redirect to error
		});
		if(record.attempt == true){
			updateQuestion(explaination,questionId)
			.then(function (updatedQuestion,questionId){
				console.log("updatedQuestion succesfull"+updatedQuestion);
				//res.send("updated question")
			},function (err){
				console.log("error in update");
			});
		}
		//return res.render('explaination', {Attempt : record.attempt });
		getQuestion(questionId)
			.then(function (question){
			return res.render('explaination', {Question : question, Attempt : record.attempt });
			// db.questions.update({'_id':0,"explainations.givenBy":1},{$push:{"explainations.$.upVotedBy":1}})
			// db.questions.update({'_id':0,"explainations.givenBy":1},{$push:{"explainations.$.upVotedBy":2},$inc:{"explainations.$.noUpVotes":1}})
		})
		.catch(function (error){
			console("caught exception");
			// TODO: error page
		});

	});
}

// Show a question with given id
router.get('/', function(req, res){
	// check authentication before showing question
	if(!(req.session && req.session.email)){
		req.session.redirect_to = '/question'+req.url;
		res.redirect('/');
	}

	getQuestion(req.query.id)
	.then(function (question){
		res.render('question', {Question : question});
	})
	.catch(function (error){
		// TODO: error page
	});
});

router.post('/', function(req, res){
	// check authentication before showing question
	if(!(req.session && req.session.email)){
		res.redirect('/');
	}

	console.log("the id is" + req.body.id + req.originalUrl);
	console.log(req.body.option);
	givenAns = req.body.option;
	//res.render('explaination', {Attempt : "record.attempt" });
	//explainationGiven =
	explainationGiven = attemptQuestion(req.body.id,givenAns,req,res);

});


// Give page to create question
router.get('/ask', function(req, res){
  	res.render('askquestion');
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
			from : "adapt.q@gmail.com",
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

module.exports = router;
