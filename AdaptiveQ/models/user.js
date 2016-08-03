var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongo.connection);

var userSchema = new Schema({
  email: { type : String, required: true},
  password: String,
  name: String,
  courses : Array,
  attempts: Array,
  hintsLeft: Number,
  resetPasswordToken: String,
  created_at: Date
});

userSchema.plugin(autoIncrement.plugin, 'Users');

var Users = mongo.model('Users', userSchema);

Users.getUserByEmail = function(email){
  	return Users.findOne({'email':email}).exec();
};

Users.getUserById = function(id){
  return Users.findById(id).exec();
};

Users.getAllUsers = function(){
  return Users.find().exec();
};

Users.createUser = function(email, password, name){
  var newUser = Users({
    email: email,
    password: password,
    name: name,
    // attempts should have questionId, courseId, options_selected , score, attempted_at
    attempts: [],
    courses: [],
    created_at: Date.now(),
    hintsLeft: 10
  });
  return newUser.save();
};

Users.addAttemptToUserId = function(userId, attempt){
    return Users.update({'_id': userId},{$push:{'attempts':attempt}}).exec();
};

Users.updateHint = function(userId){
    return Users.update({'_id':userId},{$inc:{'hintsLeft':-1}}).exec();
}

Users.getUserForToken = function(token){
    return Users.findOne({resetPasswordToken : token}).exec();
}

Users.getCourseUsers = function(courseId){
    return Users.find({ courses: { $in : [courseId] }}).exec();
}

module.exports = Users;
