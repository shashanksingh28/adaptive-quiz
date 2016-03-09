
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

module.exports = router;
