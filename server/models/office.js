var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OfficeSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('Office', OfficeSchema);
