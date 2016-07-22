var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
// below to be done only once!
autoIncrement.initialize(mongo.connection);

var conceptsSchema = new Schema({
  courseId: {type: Number, required: true},
  title: { type : String, required: true},
  children: Array
});

conceptsSchema.plugin(autoIncrement.plugin, 'Concepts');

var Concepts = mongo.model('concepts', conceptsSchema);

Concepts.getConceptByTitle = function(courseId, conceptName){
	var promise = Concepts.find({courseId: courseId, title:conceptName}).exec();
	return promise;
};

Concepts.findConceptByTitle = function(title, concepts){
  for(var i = 0; i < concepts.length; ++i)
  {
    if (concepts[i].title == title){
      return concepts[i];
    }
  }
  return null;
};

Concepts.getAllConcepts = function(courseId){
  return Concepts.find({courseId: courseId}).exec();
}

Concepts.makeTree = function(concept, concepts, parentTitle){
  if(!concept || concept == null) return null;
  var node = {};
  node.id = concept._id;
  node.name = concept.title;
  node.children = [];
  node.parent = parentTitle;
  if(!concept.children) return node;
  for(var i = 0; i < concept.children.length; ++i){
    var childConcept = Concepts.findConceptByTitle(concept.children[i], concepts);
    var childNode = Concepts.makeTree(childConcept, concepts, node.name);
    node.children.push(childNode);
  }
  return node;
}

Concepts.getConceptTree = function(callback){
  Concepts.getAllConcepts()
    .then(function (concepts){
      var root = Concepts.findConceptByTitle('Javaroot', concepts);
      var tree = Concepts.makeTree(root, concepts, 'null');
      callback(tree);
    }, function(err){
      console.log("Error fetching all concepts");
    });
}

module.exports = Concepts;
