var mongo = require('mongoose');
var Schema = mongo.Schema;

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongo.connection);

var notesSchema = new Schema({
	questionId : Number, // list of instructor's  user Id's
    userId : Number,
    text : String,
    created_at : Date
});

notesSchema.plugin(autoIncrement.plugin, 'Notes');

var Notes = mongo.model('Notes', notesSchema);

Notes.addNote = function(qId, userId, text){
    var note = Notes({
        questionId : qId,
        userId : userId,
        text : text,
        created_at : Date.now()
    });
    return note.save();
}

Notes.getUserQuestionNotes = function (userId, qId){
    return Notes.find({ userId : userId, questionId : qId}).exec();
}

Notes.getAllUserNotes = function(userId){
    return Notes.find({ userId : userId }).exec();
}

Notes.getAllQuestionNotes = function(qId){
    return Notes.find({ questionId : qId }).exec();
}

module.exports = Notes;
