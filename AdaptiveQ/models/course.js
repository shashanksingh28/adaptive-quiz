var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoincrement.initialize(mongo.connection);

var courseSchema = new Schema({
	instructors : Array, // list of instructor's  user Id's
	name : {type : String, required : true}
});

courseSchema.plugin(autoIncrement.plugin, 'Courses');

var Courses = mongo.model('Courses', courseSchema);

module.exports = Courses;
