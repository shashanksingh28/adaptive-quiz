var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();
// mongoose data models
var Question = require('../models/questionModel');
var User = require('../models/userModel');
//setup smtp for mailing
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

function updateHint(){

}

function attemptQuestion(question,givenAns,req,res){
	console.log("start time" + req.session.startTime);
	timeStart = req.session.startTime;
	console.log("inside attempt" + timeStart);
	console.log("given ans is " + givenAns);
	console.log("Question is" + question);
	console.log("inside attempt in getQuestion" + timeStart + " " + Date.now());
	timeTaken = (Date.now() - timeStart)/1000;
	console.log("time taken to answer" + timeTaken);
	hint = req.body.hintTaken;
	console.log("hint tken" + hint);
	record = {
		qid : question._id,
		concept : question.concept,
		givenAns : givenAns,
		score : 0.0,
		attemptAt: Date,
		hintTaken : hint,
		timeTaken : Number //in secs
	}
	if(hint){
		console.log("decreasing hint count in user");
		User.updateHint(req.session.user._id).then(function (question){
			console.log("decreasing hint count in user succes");
		})
		.catch(function (error){
			// TODO: error page
		});

	}

	console.log("explaination is" + req.body.explainationGiven)
	console.log("user is" + req.session.user.name)

	explaination = {
		givenById : req.session.user._id,
		givenByName : req.session.user.name,
		text : req.body.explainationGiven,
		noUpVotes: 0,
		upVotedBy: []

	};
	console.log(explaination);
	//console.log("the question id is" + questionId);
	//var correctAns = question.options[question.answers];
	//console.log(correctAns);
	var noOfCorrect = 0 ;
	for (var i = 0; i < givenAns.length; i++) {
		for (var j = 0; j < question.answers.length; j++) {
			if(givenAns[i] == question.answers[j]){
				noOfCorrect++;
			}
		};
	};
	console.log("No of correctAns " + noOfCorrect);
	noOfWrong = givenAns.length - noOfCorrect;
	console.log("No of noOfWrong " + noOfWrong);
	noOfWrongW = noOfWrong/question.options.length;
	console.log("No of noOfWrongW " + noOfWrongW);
	score = (noOfCorrect - noOfWrongW)/question.answers.length;
	console.log("No of score " + score);
	score = score * (question.difficulty + 1) * 100;
	console.log("No of score " + score);
	score = score/(timeTaken * 3);
	console.log("No of score " + score);
	if(score < 0.0){
		score = 0.0
	}
	console.log("Score for answer is " + score);
	record.score=score;	
	User.addRecordToUserId(req.session.user._id,record)
	.then(function (updatedUser){
		console.log("Attempt Recorded:"+updatedUser);
			Question.addExplanation(question._id, explaination)
			.then(function (updatedQuestion,questionId){
				console.log("updatedQuestion succesfull"+updatedQuestion);
				//res.send("updated question")
				return res.render('explaination', {Question : question, Attempt : record });
			},function (err){
				console.log("error in update");
			});
		// TODO: Show user the right answer, his answer and explaination
		//res.send("Attempt Recorded!");
	},function (err){
			console.log("error in update");
			//TODO: redirect to error
	});

}

// attempy a question
router.post('/', function(req, res){
	console.log("the id is" + req.body.id + req.originalUrl);

	//get the answer
	givenAns = req.body.options.toString();
	var Ansarray = givenAns.split(',');
	console.log("given ans is " + Ansarray);
	Question.getQuestionById(qid).
		then(function (question){
			attemptQuestion(question,givenAns,req,res);
		})
		.catch(function (error){
			// TODO: error page
		});

});

// Show a question with given id
router.get('/', function(req, res){
	userId = req.session.user._id;
	qid = req.query.id;
	//Checking if user attempted the question already
	User.getUserById(userId).then(function (User){
		check = 0
		//console.log("Got user" + User );
		records = User.records;
		var attemptRecord;
		//console.log(records);
		for (var i = 0; i < records.length; i++) {
			//console.log(records[i]);
			if( qid == records[i].qid ){
				attemptRecord = records[i];
				console.log("found qid");
				check = 1;
				break;
			}
		}
		if(check == 0){
			Question.getQuestionById(qid)
			.then(function (question){

			console.log("old starttime" + req.session.startTime);
			timeStart = Date.now();
			console.log("setting starttime" + timeStart);

			req.session.startTime = timeStart;
			console.log("set starttime as " + req.session.startTime);
			res.render('question', {Question : question, User : req.session.user});
			})
			.catch(function (error){
			// TODO: error page
			});
		}
		else{

			//TODo: remove this and and redirect to original
			Question.getQuestionById(qid)
			.then(function (question){
			console.log("Already attempted" + attemptRecord.score);
			res.render('explaination', {Question : question, Attempt : attemptRecord });

			})
			.catch(function (error){
			// TODO: error page
			});
			//TODO: change to his anser qiven for question
			//res.redirect('/');
		}

	},function (err){
		console.log("error in getting user");
	});

});


/*---------------------------------------------------------------------------
Question Asked related functions
-----------------------------------------------------------------------------*/

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

  // TODO change req.body.conceptId to req.body.concept
  	//debugger;
  	console.log("adding ques")
  		/*var newQuestion = Question({
		text: req.body.question,
		options: options,
		answers: answerss,
		concept: req.body.conceptId,
		difficulty: req.body.difficulty,
		created_at: Date.now(),
		hint: req.body.hint,
		explainations: []
	});*/
	Question.addQuestion(req.body.question,options,answerss,req.body.conceptId,req.body.difficulty,req.body.hint)
	.then(function (promise){
		console.log("question added");
		User.getAllUsers()
    .then(function(promise){
			console.log("all users are" + promise);
			//to get all users to whom mail will be send
			var userEmails = [];
			for (i in promise) {
				console.log("user is email is" + promise[i].email + promise[i])
  				userEmails.push(promise[i].email);
			}
			console.log("all users emails are" + userEmails);
			
			var mailOptions={
				from : "adapt.q@gmail.com",
			   	to : userEmails,
			   	subject : "Question of the day",
			  	text : req.body.question + " your question" + "<a href = 'https://www.google.com/?gws_rd=ssl'></a>",
			  	html : "<b>" + req.body.question + " </b>" + "<br>" +
			  			"Please click the link below to attempt the question"
			}
			console.log(mailOptions);
			smtpTransport.sendMail(mailOptions, function(error, response){
			if(error){
				console.log(error);
				res.end("error");
			}
			else{
				console.log("Message sent: " + response.message);
			}

			});

			res.redirect('/question/ask');

			},function (err){
					console.log("error in update explaination" + err);
	   		});
		});
	});




/*---------------------------------------------------------------------------
Questions Explaination related functions
-----------------------------------------------------------------------------*/
var sortByProperty = function (property) {
    return function (x, y) {
        return ((x[property] === y[property]) ? 0 : ((x[property] < y[property]) ? 1 : -1));
    };
};

function updateQuestionExp(id,givenBy,uid){

	console.log("User is " + id);
	console.log("Given by " + givenBy);
	t = id + givenBy;
	console.log("Total" + t);
	var promise = Question.update({'_id':id,
		"explainations.givenById":givenBy},
		{$push:{"explainations.$.upVotedBy":uid},
		$inc:{"explainations.$.noUpVotes":1}}).exec();

	return promise;
}

function updateQuestionExpDec(id,givenBy,uid){

	console.log("User is " + id);
	console.log("Given by " + givenBy);
	t = id + givenBy;
	console.log("Total" + t);
	var promise = Question.update({'_id':id,
		"explainations.givenById":givenBy},
		{$pull:{"explainations.$.upVotedBy":uid},
		$inc:{"explainations.$.noUpVotes": -1}}).exec();

	return promise;
}

router.get('/explain', function(req, res){
	res.render('explaination');

});

router.get('/explainlist', function(req, res) {
    	console.log("populate explainlist" + req.query.id);
    	Question.getQuestionById(req.query.id)
	.then(function (question){
		explainations = question.explainations;
		explainations.sort(sortByProperty('noUpVotes'));
		console.log("sorted explainations are" + explainations);
		res.json(explainations);
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

router.post('/explainUpdateDec', function(req, res) {
	console.log("From ajax got this " + req.body.Qid);

	Explain = req.body;
	console.log("given by" + Explain +Explain.givenBy);
	console.log("User in session is " + req.session.userId);
	updateQuestionExpDec(parseInt(Explain.Qid),parseInt(Explain.givenById),req.session.userId)
		.then(function (updatedUser){
			console.log("Explain updated");
			  res.send({ msg: '' });
		},function (err){
				console.log("error in update explaination");
   		});
});


module.exports = router;
