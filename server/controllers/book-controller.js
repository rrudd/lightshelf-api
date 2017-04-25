var Book = require('../models/book');
var BookInfo = require('../models/book-info');
var BookView = require('../models/book-view');

/**
 * Create a book objects to the books collection on the database.
 * A book object is connected to one book-info object which contains 
 * the general book information. Creates as many book objects as there's
 * defined in request parameter "numberOfCopies".
 */
createBook = function(bookInfo, req, res) {
  let newBooks = [];
  for (let i = 0; i < req.body.numberOfCopies; i++) {
    var book = new Book();
    book.id = bookInfo.id;
    book.office = req.body.office_id;
    book.current_loan = null;
    book.bookInfo = bookInfo._id;

    newBooks.push(book);
  }

  if (newBooks.length > 0) {
    //Insert new book items to the db
    Book.collection.insert(newBooks, function (err, books) {
      if (err) {
        console.log(err);
        if (err.code == 11000) {
          res.status(403).json({ status: 'failure', message: 'This book is already in the library!' });
        }
        else res.status(500).json({ status: 'failure', message: 'Operation failed.' });
      }
      else {
        res.status(200).json({ status: 'success', books: books });
      }
    });
  }

}

/**
 * Save a book to the library.
 */
saveBook = function(req, res) {

  //TODO what if the book info already exists? should do find first
  var bookInfo = new BookInfo()
  bookInfo.id = req.body.id;
  bookInfo.title = req.body.bookInfo.title;
  bookInfo.description = req.body.bookInfo.description;
  bookInfo.authors = req.body.bookInfo.authors;
  bookInfo.pageCount = req.body.bookInfo.pageCount;
  bookInfo.imageLinks = req.body.bookInfo.imageLinks;

  bookInfo.save(function(err) {
    if (err) {
      //TODO if cannot create info cause it already exists?
      console.log(err);
      res.status(500).json({status: 'failure', message: 'Failed to create book info'});
    } else {
      createBook(bookInfo, req, res);
    }
  });
}

//TODO should we also remove the BookInfo document if this is the last copy of that book?
deleteBook = function(req, res) {
  Book.remove({
      _id: req.params.book_id
  }, function(err, book) {
      if (err) res.send(err);
      else res.status(200).json({ status: 'success', book: book });
  });
}


getAllBooks = (req, res) => {
    Book.find(function(err, books) {
      if (err) res.send(err);
      res.json(BookView.transformBookArrayToViews(books));
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

module.exports = {saveBook: saveBook, deleteBook: deleteBook, findBook: findBook, getAllBooks: getAllBooks};
