var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
// below to be done only once!
autoIncrement.initialize(mongo.connection);

var questionSchema = new Schema({
  text: { type : String, required: true},//question text
  options: Array,//list of options, array of strings
  answer: Number,//Array of Number
  conceptId: Number,//String
  difficulty: Number,//Number {0,1,2}
  created_at: Date,
  updated_at: Date,
  hint: String,
  explainations: Array
});

questionSchema.plugin(autoIncrement.plugin, 'Question');

var Question = mongo.model('Question', questionSchema);

module.exports = Question;
