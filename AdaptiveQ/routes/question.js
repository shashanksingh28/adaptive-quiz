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
//setup smtp for mailing



/*---------------------------------------------------------------------------
Question Asked related functions
-----------------------------------------------------------------------------*/

function createQuestion(question){
	var promise = question.save();
	return promise;
}

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





/*---------------------------------------------------------------------------
Questions Explaination related functions
-----------------------------------------------------------------------------*/
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


router.post('/explain', function(req, res){
	console.log("From ajax got this " + req.body)
        res.send(
            { msg: '' } 
        );
   

});

router.get('/explainlist', function(req, res) {
    	console.log(req.query.id)
    	getQuestion(req.query.id)
	.then(function (question){
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
