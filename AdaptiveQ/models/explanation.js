var mongo = require('mongoose');
var Schema = mongo.Schema;

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongo.connection);

var explanationSchema = new Schema({
	questionId : Number, // list of instructor's  user Id's
    userId : Number,
    userName : String,
    text : String,
    votes : [Number],
    created_at : Date
});

explanationSchema.plugin(autoIncrement.plugin, 'Explanations');

var Explanations = mongo.model('Explanations', explanationSchema);

Explanations.addExplanation = function(qId, userId, userName, text){
    var explanation = Explanations({
        questionId : qId,
        userId : userId,
        userName : userName,
        text : text,
        votes : [],
        created_at : Date.now()
    });
    return explanation.save();
}

Explanations.getExplanations = function (qId){
    return Explanations.find({questionId : qId}).exec();
}

Explanations.getExplanationById = function(expId){
    return Explanations.findById(expId).exec();
}

module.exports = Explanations;
