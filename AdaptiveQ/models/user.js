var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongo.connection);

var userSchema = new Schema({
  email: { type : String, required: true},
  password: String,
  name: String,
  courses : Array,
  records: Array,
  created_at: Date,
  hintsLeft: Number,
  resetPasswordToken: String
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
    records: [],
    courses: [],
    created_at: Date.now(),
    hintsLeft: 10
  });
  return newUser.save();
};

Users.addRecordToUserId = function(userId,record){
  return Users.update({'_id': userId},{$push:{'records':record}}).exec();
};

Users.updateHint = function(userId){
  return Users.update({'_id':userId},{$inc:{'hintsLeft':-1}}).exec();
}

Users.getUserForToken = function(token){
  return Users.findOne({resetPasswordToken : token}).exec();
}

module.exports = Users;
