var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Book = require('./book');
var User = require('./user')

var LoanSchema = new Schema({
  book: {
    type: Schema.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

var autoPopulateUser = function(next) {
  this.populate('user', 'fullname');
  next();
};

LoanSchema
  .pre('findOne', autoPopulateUser)
  .pre('find', autoPopulateUser);

module.exports = mongoose.model('Loan', LoanSchema);
