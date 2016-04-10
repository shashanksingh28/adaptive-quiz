var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();
// mongoose data models
var Question = require('../models/questionModel');
var Users = require('../models/userModel');
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "adapt.q",
        pass: "quizoftheday"
    }
});


/*---------------------------------------------------------------------------
Question Display related functions
-----------------------------------------------------------------------------*/
function getUser(userId){
	var promise = Users.findById(userId).exec();
	return promise
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

function getQuestion(id){
	var promise = Question.findById(id).exec();
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
	userId = req.session.userId;
	qid = req.query.id;
	//Checking if user attempted the question already
	getUser(userId).then(function (User){		
		check = 0
		console.log("Got user" + User );
		records = User.records;
		console.log(records);
		for (var i = 0; i < records.length; i++) {
			console.log(records[i]);
			if( qid == records[i].qid ){
				console.log("found qid");
				check = 1;
				break;
			}
		}
		if(check == 0){
			getQuestion(qid)
			.then(function (question){
			res.render('question', {Question : question});
			})
			.catch(function (error){
			// TODO: error page
			});
		}
		else{
			//TODO: change to his anser qiven for question
			res.redirect('/');
		}

	},function (err){
		console.log("error in getting user");     
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
//setup smtp for mailing



/*---------------------------------------------------------------------------
Question Asked related functions
-----------------------------------------------------------------------------*/

function createQuestion(question){
	console.log("saving quetion in db")
	var promise = question.save();
	return promise;
}

// Give page to create question
router.get('/ask', function(req, res){
  	res.render('askquestion');
  });
// save new question
router.post('/ask', function(req, res){
	//console.log(req.body.question + req.body.options + req.body.answers);
	// TODO: add multiple options to questions
	answerss = JSON.parse(req.body.answers);
	options = JSON.parse(req.body.options);
	console.log(req.body.conceptId);
	var newQuestion = Question({
		text: req.body.question,
		options: options,
		answer: answerss,
		conceptId: req.body.conceptId,
		difficulty: req.body.difficulty,
		created_at: Date.now(),
		updated_at: Date.now(),
		hint: "",
		explainations: []
	});
	console.log(newQuestion.answer);
	console.log(newQuestion);
	createQuestion(newQuestion)
	.then(function (promise){	
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

		},function (err){
				console.log("error in update explaination" + err);     
   		});
});





/*---------------------------------------------------------------------------
Questions Explaination related functions
-----------------------------------------------------------------------------*/
var sortByProperty = function (property) {
    return function (x, y) {
        return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
    };
};

function updateQuestionExp(id,givenBy,uid){

	console.log("User is " + id);
	console.log("Given by " + givenBy);
	t = id + givenBy;
	console.log("Total" + t);
	var promise = Question.update({'_id':id,
		"explainations.givenBy":givenBy},
		{$push:{"explainations.$.upVotedBy":uid},
		$inc:{"explainations.$.noUpVotes":1}}).exec();

	return promise;
}

router.get('/explain', function(req, res){
	res.render('explaination');

});

router.get('/explainlist', function(req, res) {
    	console.log(req.query.id);
    	getQuestion(req.query.id)
	.then(function (question){
		explainations = question.explainations;
		explainations.sort(sortByProperty('noUpVotes'));
		console.log("sorted explainations are" + explainations);
		res.json(question);
	})
});

router.post('/explainUpdate', function(req, res) {
	console.log("From ajax got this " + req.body.Qid);

	Explain = req.body;
	console.log(Explain.givenBy);
	console.log("User in session is " + req.session.userId);
	updateQuestionExp(parseInt(Explain.Qid),parseInt(Explain.givenBy),req.session.userId)
		.then(function (updatedUser){
			console.log("Explain updated");
			  res.send({ msg: '' });
		},function (err){
				console.log("error in update explaination");     
   		});
});


module.exports = router;
