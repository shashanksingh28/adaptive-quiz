var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
// below to be done only once!
autoIncrement.initialize(mongo.connection);

var conceptsSchema = new Schema({
  courseId: {type: Number, required: true},
  name : { type : String, required: true},
  children : Array,
  created_at : Date
});

conceptsSchema.plugin(autoIncrement.plugin, 'Concepts');

var Concepts = mongo.model('concepts', conceptsSchema);

Concepts.getConceptByName = function(courseId, conceptName){
	return Concepts.findOne({courseId: courseId, name:conceptName}).exec();
};

Concepts.getCourseConcepts = function(courseId){
    return Concepts.find({courseId: courseId}).exec();
}

Concepts.addConcept = function(courseId, name){
    var concept = Concepts({
        courseId : courseId,
        name : name,
        created_at : Date.now()
    });
    return concept.save();
}

module.exports = Concepts;
