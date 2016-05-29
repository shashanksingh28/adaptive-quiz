var express = require('express');
var nodemailer = require("nodemailer");
var router = express.Router();
var localhost = "http://52.40.100.41"
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

function requireLogin (req, res, next) {
  if (!req.session.user) {
    req.session.redirect_to = '/question' + req.url;
    res.redirect('/');
  } else {
    next();
  }
};


/*---------------------------------------------------------------------------
Question Display related functions
-----------------------------------------------------------------------------*/


function attemptQuestion(question,givenAns,req,res){
	userId = req.session.user._id;
	//console.log("start time" + req.session.startTime);
	timeStart = req.session.startTime;
	timeTaken = (Date.now() - timeStart)/1000;
	hint = req.body.hintTaken;
	record = {
		qid : question._id,
		concept : question.concept,
		givenAns : givenAns,
		score : 0.0,
		attemptAt: Date.now(),
		hintTaken : hint,
		timeTaken : timeTaken,
		//in secs
	}
	if(hint == true){
		//console.log("decreasing hint count in user");
		User.updateHint(req.session.user._id).then(function (question){
			//console.log("decreasing hint count in user success");
		})
		.catch(function (error){
			// TODO: error page
		});

	}

	var noOfCorrect = 0 ;
	for (var i = 0; i < givenAns.length; i++) {
		for (var j = 0; j < question.answers.length; j++) {
			if(givenAns[i] == question.answers[j]){
				noOfCorrect++;
			}
		};
	};
	noOfWrong = givenAns.length - noOfCorrect;
	//console.log("No of noOfWrong " + noOfWrong);
	noOfWrongW = noOfWrong/question.options.length;
	//console.log("No of noOfWrongW " + noOfWrongW);
	score = (noOfCorrect - noOfWrongW)/question.answers.length;
	//console.log("No of score " + score);
	dividend = (question.difficulty + 1) * 10;
	divisor = dividend + Math.log(timeTaken);
	timediff = dividend/divisor;
	//console.log("divisor " + divisor);
	score = score + timediff;
	console.log("No of score " + score);
	if(score < 0.0){
		score = 0.0
	}
	console.log("Score for answer is " + score);
	record.score=score;
	User.addRecordToUserId(req.session.user._id,record)
	.then(function (updatedUser){
		//console.log("Attempt Recorded:"+updatedUser);
		upvotedExp = {
  			upvoted : false,
  			givenById : []
  		}
  		//res.redirect('/?valid=' + string);
		res.render('explaination', {Question : question, Attempt : record, Upvote : upvotedExp, Userid:userId});

		// TODO: Show user the right answer, his answer and explaination
		//res.send("Attempt Recorded!");
	},function (err){
			console.log("error in update");
			//TODO: redirect to error
	});

}

// attempy a question
router.post('/', function(req, res){
	//console.log("the id is" + req.body.id + req.originalUrl);

	//get the answer
	givenAns = req.body.options.toString();
	var Ansarray = givenAns.split(',');
	console.log("given ans is " + Ansarray);
	Question.getQuestionById(qid).
		then(function (question){
			attemptQuestion(question,Ansarray,req,res);
		})
		.catch(function (error){
			// TODO: error page
		});

});

function assembleQuestionsForUser(user, questions){
	var response = [];
    // for user to see different links of attempted and not attempted
    for(var i = 0; i < questions.length; ++i){
      var hasVisited = false;
      for(var j = 0; j < user.records.length; ++j){
        if (user.records[j].qid == questions[i]._id){
          hasVisited = true;
          break;
        }
      }
      var question = { QuestionId : questions[i]._id , Tag: questions[i].concept, Visited: hasVisited } ;
      response.push(question);
    }
    return response;
}


// Show a question with given id
router.get('/', requireLogin, function(req, res){
	userId = req.session.user._id;
	qid = req.query.id;
  concept = req.query.concept;
  all = req.query.all;
  if(qid){
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

  			//console.log("old starttime" + req.session.startTime);
  			timeStart = Date.now();
  			//console.log("setting starttime" + timeStart);

  			req.session.startTime = timeStart;
  			//console.log("set starttime as " + req.session.startTime);
  			res.render('question', {Question : question, User : req.session.user, isTeacher : req.session.isTeacher});
  			})
  			.catch(function (error){
  			// TODO: error page
  			});
  		}
  		else{
  			//TODo: remove this and and redirect to original
  			Question.getQuestionById(qid)
  			.then(function (question){
  			userId = req.session.user._id;
  			upvotedExp = {
  				upvoted : false,
  				givenById : []
  			}
  			console.log("Already attempted" + attemptRecord.score + "User" + userId);
  			for (var i = question.explainations.length - 1; i >= 0; i--) {
  				//console.log("givenBy by" + question.explainations[i].givenByName);
  				for (var j = question.explainations[i].upVotedBy.length - 1; j >= 0; j--) {
  					if(question.explainations[i].upVotedBy[j] == userId){
  						upvotedExp.upvoted = true;
  						upvotedExp.givenById.push(question.explainations[i].givenById);
  					}
  				};
  			};

  			//console.log("upvotedExp is");
  			//console.log(upvotedExp);

  			res.render('explaination', {Question : question, Attempt : attemptRecord, Upvote : upvotedExp, Userid:userId, isTeacher : req.session.isTeacher});
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
  }else if(concept){
    Question.getQuestionIdsOfConcept(concept)
    .then(function (questions){
      User.getUserById(userId)
      .then(function (user){
        var response = assembleQuestionsForUser(user,questions);
        console.log(response);
        res.send(response);
      });
    });
  }else if(all){
    Question.getAllQuestionIds()
    .then(function (questions){
      User.getUserById(userId)
      .then(function (user){
        var response = assembleQuestionsForUser(user,questions);
        res.send(response);
      });
    });
  }
});


/*---------------------------------------------------------------------------
Question Asked related functions
-----------------------------------------------------------------------------*/

// Give page to create question
router.get('/ask', function(req, res){
  	res.render('askquestion', {isTeacher : req.session.isTeacher});
  });
// save new question
router.post('/ask', function(req, res){
	//console.log(req.body.question + req.body.options + req.body.answers);
	// TODO: add multiple options to questions
	answerss = JSON.parse(req.body.answers);
	options = JSON.parse(req.body.options);
	//console.log(req.body.conceptId);

  // TODO change req.body.conceptId to req.body.concept
  	//debugger;
  	console.log("adding ques")
	Question.addQuestion(req.body.question,options,answerss,req.body.conceptId,req.body.difficulty,req.body.hint)
	.then(function (promise){
		var id = promise._id;
		//console.log(promise);
		console.log("question added");
		User.getAllUsers()
    .then(function(promise){
			//console.log("all users are" + promise);
			//to get all users to whom mail will be send
			var userEmails = [];
			for (i in promise) {
				//console.log("user is email is" + promise[i].email + promise[i])
  				userEmails.push(promise[i].email);
			}
			//console.log("all users emails are" + userEmails);

			var mailOptions={
				from : "adapt.q@gmail.com",
			   	to : userEmails,
			   	subject : "Question of the day",
			  	text : req.body.question + " your question" + "<a href = 'https://www.google.com/?gws_rd=ssl'></a>",
			  	html : "<b>" + "Hello here is your question of the day! Best Of Luck!" + " </b>" + "<br>" +
			  			"Please click the link below to attempt the question" + " <br> " + localhost +"/question?id=" + id + " <br> " 
			}
			//console.log(mailOptions);
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

	//console.log("User is " + id);
	//console.log("Given by " + givenBy);
	t = id + givenBy;
	//console.log("Total" + t);
	var promise = Question.update({'_id':id,
		"explainations.givenById":givenBy},
		{$push:{"explainations.$.upVotedBy":uid},
		$inc:{"explainations.$.noUpVotes":1}}).exec();

	return promise;
}

function updateQuestionExpDec(id,givenBy,uid){

	//console.log("User is " + id);
	//console.log("Given by " + givenBy);
	t = id + givenBy;
	//console.log("Total" + t);
	var promise = Question.update({'_id':id,
		"explainations.givenById":givenBy},
		{$pull:{"explainations.$.upVotedBy":uid},
		$inc:{"explainations.$.noUpVotes": -1}}).exec();

	return promise;
}

router.get('/explain', function(req, res){
	res.render('explaination',{ isTeacher : req.session.isTeacher });

});

router.get('/explainlist', function(req, res) {
    	//console.log("populate explainlist" + req.query.id);
    	Question.getQuestionById(req.query.id)
	.then(function (question){
		explainations = question.explainations;
		explainations.sort(sortByProperty('noUpVotes'));
		//console.log("sorted explainations are" + explainations);
		res.json(explainations);
	})
});

router.post('/explainUpdate', function(req, res) {
	//console.log("From ajax got this " + req.body.Qid);

	Explain = req.body;
	//console.log(Explain.givenBy);
	//console.log("User in session is " + req.session.user._id);
	updateQuestionExp(parseInt(Explain.Qid),parseInt(Explain.givenBy),req.session.user._id)
		.then(function (updatedUser){
			//console.log("Explain updated");
			  res.send({ msg: '' });
		},function (err){
				console.log("error in update explaination");
   		});
});

router.post('/explainUpdateDec', function(req, res) {
	//console.log("From ajax got this " + req.body.Qid);

	Explain = req.body;
	//console.log("given by" + Explain.givenBy);
	//console.log("User in session is " + req.session.user._id);
	updateQuestionExpDec(parseInt(Explain.Qid),parseInt(Explain.givenBy),req.session.user._id)
		.then(function (updatedUser){
			console.log("Explain updated");
			  res.send({ msg: '' });
		},function (err){
				console.log("error in update explaination");
   		});
});

router.post('/addUpdateDec', function(req, res) {
	//console.log("From ajax got this " + req.body.ExplainText);
	Explain = req.body.ExplainText;
	explaination = {
		givenById : req.session.user._id,
		givenByName : req.session.user.name,
		text : Explain,
		noUpVotes: 0,
		upVotedBy: []

	};
	console.log(explaination);
	//console.log(req.body.qid);

	Question.addExplanation(req.body.qid, explaination)
	.then(function (updatedQuestion,questionId){
		//console.log("updatedQuestion succesfull"+updatedQuestion);
		 res.send({ msg: 'done', explaination : explaination});
	},function (err){
		//console.log("error in add ");
	});

});

module.exports = router;
