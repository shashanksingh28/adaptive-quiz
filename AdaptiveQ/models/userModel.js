var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
// below to be done only once!
autoIncrement.initialize(mongo.connection);

var userSchema = new Schema({
  email: { type : String, required: true},
  password: String,
  name: String,
  records: Array,
  created_at: Date,  
  hintsLeft: Number

});

userSchema.plugin(autoIncrement.plugin, 'User');

var User = mongo.model('User', userSchema);

module.exports = User;
