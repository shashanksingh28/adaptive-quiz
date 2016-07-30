var mongo = require('mongoose');
var Schema = mongo.Schema;

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongo.connection);

var courseSchema = new Schema({
	instructorIds : Array, // list of instructor's  user Id's
	name : {type : String, required : true}
});

courseSchema.plugin(autoIncrement.plugin, 'Courses');

var Courses = mongo.model('Courses', courseSchema);

Courses.getCourseById = function (courseId){
    return Courses.findOne({_id: courseId}).exec();
}

Courses.getAllCourses = function (){
	return Courses.find({}).exec();
}

module.exports = Courses;
