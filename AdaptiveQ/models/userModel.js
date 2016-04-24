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

User.getUserByEmail = function(email){
  return User.findOne({'email':email}).exec();
};

User.getUserById = function(id){

  return User.findById(id).exec();
};

User.getAllUsers = function(){
  return User.find().exec();
};

User.createUser = function(email, password, name){
  var newUser = User({
    email: email,
    password: password,
    name: name,
    records: [],
    created_at: Date.now(),
    hintsLeft: 10
  });
  return newUser.save();
};

User.addRecordToUserId = function(userId,record){
  return User.update({'_id': userId},{$push:{'records':record}}).exec();
};

//User.updateHint(req.session.user._id);
User.updateHint = function(userId){
  return User.update({'_id':userId},{$inc:{'hintsLeft':-1}}).exec();
  
}

module.exports = User;
