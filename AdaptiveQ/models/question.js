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
	concepts: Array, // Array of strings
	created_at: Date,
	hint: String,
	multiOption : Boolean
});

questionSchema.plugin(autoIncrement.plugin, 'Questions');

var Questions = mongo.model('Questions', questionSchema);

Questions.addQuestion = function(question){
    var newQuestion = Questions({
        courseId : question.courseId,
        text : question.text,
        code : question.code,
        options : question.options,
        answers : question.answers,
        concepts : question.concepts,
        hint : question.hint,
        created_at : Date.now(),
		multiOption : question.answers.length > 1
    });

    return newQuestion.save();
}

Questions.getQuestionById = function(qId){
    return Questions.findById(qId).exec();
};

Questions.getQuestionsHavingConcept = function(courseId, concept){
    return Questions.find({courseId: courseId, concepts : { "$in" : [concept] }}).exec();
}

Questions.getAllCourseQuestions = function(courseId){
    return Questions.find({courseId: courseId}).exec();
}

module.exports = Questions;
