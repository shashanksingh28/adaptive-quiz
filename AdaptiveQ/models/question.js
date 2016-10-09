var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongo.connection);

var questionSchema = new Schema({
	courseId: {type: Number, required: true},
	text: {type : String, required: true}, // question text
	code: String,
	options: Array, // list of options, array of strings
	answers: Array, // Array of Number
	concepts: Array, // Array of strings
	created_at: Date,
	hint: String,
	multiOption : Boolean,
	published : {type : Boolean, required: true},
	publishTime: {type : Date, required: true}
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
		multiOption : question.answers.length > 1,
		published : false,
		publishTime : new Date(question.publishTime)
    });

    return newQuestion.save();
}

Questions.updateQuestion = function(q, updatedQ){
    q.text = updatedQ.text;
    q.code = updatedQ.code;
    q.options = updatedQ.options;
    q.answers = updatedQ.answers;
    q.concepts = updatedQ.concepts;
    q.multiOption = updatedQ.answers.length > 1;
    q.published = updatedQ.published;
    q.publishTime = new Date(updatedQ.publishTime);

    q.markModified('options');
    q.markModified('answers');
    q.markModified('concepts');
    
    return q.save();
}

Questions.getQuestionById = function(qId){
    return Questions.findById(qId).exec();
};

Questions.getQuestionsHavingConcept = function(courseId, concept){
    return Questions.find({courseId: courseId, concepts : { "$in" : [concept] }}).exec();
}

Questions.getAllCourseQuestions = function(courseId, isInstructor){
    // If not instructor, do not show un-published questions
    if(isInstructor){
        return Questions.find({courseId: courseId}).lean().exec();
    }
    else{
        return Questions.find({courseId : courseId, published : true}).lean().exec();
    }
}

Questions.getCourseUnpublished = function(courseId){
    return Questions.find({publishTime : {$lt : new Date()}, published : false, courseId : courseId});
}

module.exports = Questions;
