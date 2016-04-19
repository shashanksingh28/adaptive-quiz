var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
// below to be done only once!
autoIncrement.initialize(mongo.connection);

var questionSchema = new Schema({
  text: { type : String, required: true},//question text
  options: Array,//list of options, array of strings
  answers: Array,//Array of Number
  concept: String,//String
  difficulty: Number,//Number {0,1,2}
  created_at: Date,
  hint: String,
  explainations: Array
});

questionSchema.plugin(autoIncrement.plugin, 'Question');

var Question = mongo.model('Question', questionSchema);
//Question.addQuestion(req.body.question,options,answerss,req.body.concept,req.body.difficulty,req.body.hint)
  
Question.addQuestion = function(text,options,answers,conceptName,difficulty,hint){
  console.log("in add" + text);
  var newQuestion = Question({
		text: text,
		options: options,
		answers: answers,
		concept: conceptName,
		difficulty: difficulty,
    hint: hint,
		created_at: Date.now(),
		explainations: []
	});
  console.log("newQuestion");
  return newQuestion.save();
}

Question.getQuestionById = function(qId){
  return Question.findById(qId).exec();
};

Question.addExplanation = function(qId, explanation){
  return Question.update({'_id': qid},{$push:{'explainations':explanation}}).exec();
};


module.exports = Question;
