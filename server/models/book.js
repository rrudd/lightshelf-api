var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Loan = require('./loan');
var Office = require('./office');

var BookSchema = new Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  publishedDate: {
    type: String
  },
  pageCount: {
    type: Number
  },
  imageLinks: {
    smallThumbnail: {
      type: String
    },
    thumbnail: {
      type: String
    },
  },
  authors: {
    type: [String]
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
  next();
};

BookSchema
  .pre('findOne', autoPopulateLoan)
  .pre('find', autoPopulateLoan);

module.exports = mongoose.model('Book', BookSchema);
