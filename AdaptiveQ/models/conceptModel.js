var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
// below to be done only once!
autoIncrement.initialize(mongo.connection);

var conceptsSchema = new Schema({
  title: { type : String, required: true},
  children: Array
});

conceptsSchema.plugin(autoIncrement.plugin, 'Concepts');

var Concepts = mongo.model('concepts', conceptsSchema);

module.exports = Concepts ;
