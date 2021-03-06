var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  firstName: String,
  lastName: String,
  pwHash: String,
  pwSalt: String
});

module.exports = mongoose.model('User', UserSchema);
