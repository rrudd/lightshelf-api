var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookInfoSchema = new Schema({
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
  }
});

module.exports = mongoose.model('BookInfo', BookInfoSchema);