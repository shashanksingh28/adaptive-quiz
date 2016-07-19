var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongo.connection);

var userSchema = new Schema({
  email: { type : String, required: true},
  password: String,
  name: String,
  records: Array,
  created_at: Date,
  hintsLeft: Number,
  resetPasswordToken: String
});

userSchema.plugin(autoIncrement.plugin, 'Users');

var Users = mongo.model('Users', userSchema);

Users.getUserByEmail = function(email){
  return User.findOne({'email':email}).exec();
};

Users.getUserById = function(id){

  return User.findById(id).exec();
};

Users.getAllUsers = function(){
  return User.find().exec();
};

Users.createUser = function(email, password, name){
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

Users.addRecordToUserId = function(userId,record){
  return User.update({'_id': userId},{$push:{'records':record}}).exec();
};

Users.updateHint = function(userId){
  return User.update({'_id':userId},{$inc:{'hintsLeft':-1}}).exec();
}

Users.getUserForToken = function(token){
  return User.findOne({resetPasswordToken : token}).exec();
}

module.exports = Users;
