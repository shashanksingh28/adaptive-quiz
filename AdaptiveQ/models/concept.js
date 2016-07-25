var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
// below to be done only once!
autoIncrement.initialize(mongo.connection);

var conceptsSchema = new Schema({
  courseId: {type: Number, required: true},
  name : { type : String, required: true},
  children: Array
});

conceptsSchema.plugin(autoIncrement.plugin, 'Concepts');

var Concepts = mongo.model('concepts', conceptsSchema);

Concepts.getConceptByName = function(courseId, conceptName){
	return Concepts.find({courseId: courseId, name:conceptName}).exec();
};

Concepts.getCourseConcepts = function(courseId){
    return Concepts.find({courseId: courseId}).exec();
}

Concepts.addConcept = function(courseId, name){
    var concept = Concepts({
        courseId : courseId,
        name : name
    });
    return concept.save();
}

module.exports = Concepts;
