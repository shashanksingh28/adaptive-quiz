var mongo = require('mongoose');
var Schema = mongo.Schema;
var autoIncrement = require('mongoose-auto-increment');
// below to be done only once!
autoIncrement.initialize(mongo.connection);

var logSchema = new Schema({
    user_id : Number,
    event_type : String,
    object_type : String,
    object_value : String,
    created_at : Date
});

logSchema.plugin(autoIncrement.plugin, 'Logs');

var Logger = mongo.model('Logs', logSchema);

Logger.logAction = function(userId, event_type, object_type, object_value){
  var newlog = Logger({
    user_id : userId,
    event_type : event_type,
    object_type : object_type,
    object_value : object_value,
    created_at : Date.now()
  });
  return newlog.save();
}

module.exports = Logger;
