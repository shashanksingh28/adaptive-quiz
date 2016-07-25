var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongo.connection);

var questionSchema = new Schema({
	courseId: {type: Number, required: true},
	text: { type : String, required: true}, // question text
	code: String,
	options: Array, // list of options, array of strings
	answers: Array, // Array of Number
	concept: String,
	difficulty: Number, // Number {0,1,2}
	created_at: Date,
	hint: String,
  	explainations: Array
});

questionSchema.plugin(autoIncrement.plugin, 'Questions');

var Questions = mongo.model('Questions', questionSchema);

Questions.addQuestion = function(question){
    var newQuestion = Questions({
        courseId : question.courseId,
        text : question.text,
        options : question.options,
        answers : question.answers,
        concepts : question.concepts,
        hint : question.hint,
        created_at : Date.now(),
        explanations : []
    });

    return newQuestion.save();
}

Questions.getQuestionById = function(qId){
  return Question.findById(qId).exec();
};

Questions.addExplanation = function(qId, explanation){
  return Question.update({'_id': qid},{$push:{'explainations':explanation}}).exec();
};

Questions.getQuestionIdsOfConcept = function(courseId, conceptName){
  return Question.find({courseId: courseId, concept:conceptName},{ _id : 1 , concept : 1}).exec();
}

Questions.getAllCourseQuestionIds = function(courseId){
  return Question.find({courseId: courseId},{ _id : 1 , concept : 1}).exec();
}

module.exports = Questions;
