var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Loan = require('./loan');
var Office = require('./office');

var BookSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  bookInfo: {
    type: Schema.ObjectId,
    ref: 'BookInfo'
  },
  current_loan: {
    type: Schema.ObjectId,
    ref: 'Loan',
    default: null
  },
  office: {
    type: Schema.ObjectId,
    ref: 'Office'
  }
});

var autoPopulateLoan = function(next) {
  this.populate('current_loan');
  this.populate('bookInfo');
  next();
};

BookSchema
  .pre('findOne', autoPopulateLoan)
  .pre('find', autoPopulateLoan);

module.exports = mongoose.model('Book', BookSchema);
