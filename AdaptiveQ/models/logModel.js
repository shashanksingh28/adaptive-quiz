var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
// below to be done only once!
autoIncrement.initialize(mongo.connection);

var logSchema = new Schema({
  userId: Number,
  category: String,
  action: String,
  content: String,
  time: Date
});

logSchema.plugin(autoIncrement.plugin, 'myLogger');

var myLogger = mongo.model('Log', logSchema);

myLogger.logAction = function(userId, category, action, content){
  var newlog = myLogger({
    userId : userId,
    category : category,
    action : action,
    content: content,
    time : Date.now()
  });
  return newlog.save();
}

module.exports = myLogger;
