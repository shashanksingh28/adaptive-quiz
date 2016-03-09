
var express = require('express');
var router = express.Router();
var qn = {"question" : "1. The word which means house is", "option1": "A","option2": "B","option3": "C","option4": "D","answer":"A"}
router.get('/', function(req, res){
	
  res.render('question', {Question : qn});
  });

router.post('/', function(req, res){ 
  var ans = req.body.option;
  //check ans here 
  console.log(ans);
  res.send(ans);  
  });

router.get('/ask', function(req, res){
	
  res.render('askquestion', {Question : qn});
  });

router.post('/ask', function(req, res){
	var question = req.body.question;
	var op1 = req.body.option1;
	var op2 = req.body.option2;
	var op3 = req.body.option3;
	var op4 = req.body.option4;
	var ans = req.body.answer;
  res.send(question + " " + ans);
  });

module.exports = router;

