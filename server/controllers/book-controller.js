var Book = require('../models/book');

saveBook = function(req, res) {

  var book = new Book();
  book.id = req.body.id;
  book.title = req.body.title;
  book.description = req.body.description;
  book.authors = req.body.authors;
  book.pageCount = req.body.pageCount;
  book.imageLinks = req.body.imageLinks;
  book.office = req.body.office_id;
  book.current_loan = null;

  book.save(function(err) {
    if (err) {
      console.log(err);
      if (err.code == 11000) {
        res.status(403).json({ status: 'failure', message: 'This book is already in the library!' });
      }
      else res.status(500).json({ status: 'failure', message: 'Operation failed.' });
    }
    else {
      res.status(200).json({ status: 'success', book: book });
    }
  });
}

deleteBook = function(req, res) {
  Book.remove({
      _id: req.params.book_id
  }, function(err, book) {
      if (err) res.send(err);
      else res.status(200).json({ status: 'success', book: book });
  });
}

/**
 * Find books from library by title. Uses a partial case-insensitive match by
 * book title. Response will contain an array of books that match the criteria.
 */
findBook = function(req, res) {
  let query = Book.where({ title : { $regex : req.query.title, $options : "i"} });
  query.exec(function(err, books) {
    if (err) {
      console.log(err);
      res.status(500).json({status : 'failure', message: 'Operation failed.'});
    } else {
      res.status(200).json({status: 'success', books: books})
    }
  });
}

module.exports = {saveBook: saveBook, deleteBook: deleteBook, findBook: findBook};
