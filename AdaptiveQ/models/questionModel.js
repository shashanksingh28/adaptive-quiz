var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
// below to be done only once!
autoIncrement.initialize(mongo.connection);

var questionSchema = new Schema({
  text: { type : String, required: true},
  options: Array,
  answer: Number,
  conceptId: Number,
  difficulty: Number,
  created_at: Date,
  updated_at: Date
});

questionSchema.plugin(autoIncrement.plugin, 'Question');

var Question = mongo.model('Question', questionSchema);

module.exports = Question;
