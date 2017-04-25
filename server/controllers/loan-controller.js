var Book = require('../models/book');
var Loan = require('../models/loan');
var config = require('../../config.js');
var jwt = require('jwt-simple');
var BookView = require('../models/book-view');

borrowBook = function(req, res) {
  var book_id = req.params.book_id;
  var token = getToken(req.headers);

  // Check that the user exists
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    user_id = decoded.id;
    user_name = decoded.fullname;


      //Find all book by the id and choose one of them for loan.
      Book.find({ id: book_id, current_loan: null}, function(err, books) {
        if (!books) res.json({ status: 'failure', message: 'Cannot find book.' });
        else {
          //Choose the first available book
          let bookObjectId = books[0]._id;

          var new_loan = new Loan();
          new_loan.book = book_id;
          new_loan.user = user_id;
          new_loan.save(function(err, loan) {
            if (err) res.json({ status: 'failure', message: 'Borrowing the book failed.' });
            else {
              Book.findByIdAndUpdate(bookObjectId, {current_loan: loan._id}, {new: true}, function(err, newBook) {
                if (err) res.json({ status: 'failure', message: 'Borrowing the book failed!' });
                else {
                  //Populate the book object with the loan object for usagage in the client
                  Book.populate(newBook, {path: 'current_loan bookInfo'}, function(err, book) {
                    BookView.transformBookToView(newBook).then((bookView) => {
                      res.json({ status: 'success', book: bookView });
                    }) ;
                  });
                }
              });
            }
          });
        }
      });
  }
  else res.status(401).json({ status: 'failure', message: 'No authentication token supplied.' });
}

returnBook = function(req, res) {
  var book_id = req.params.book_id;
  var loan_id = req.params.loan_id;
  var token = getToken(req.headers);

  if (token) {
    var decoded = jwt.decode(token, config.secret);
    user_id = decoded.id;
    Loan.findById(loan_id, function(err, loan) {
      if (err) {
        res.json({ status: 'failure', message: 'No such loan found!' });
        return;
      }
      if (user_id != loan.user._id) {
        res.json({ status: 'failure', message: 'Cannot return the loan of another user.' });
        return;
      }
      else {
        loan.active = false;
        loan.save(function(err, loan) {
          if (err) res.json({ status: 'failure', message: 'Returning the book failed!' });
          else {
            Book.findByIdAndUpdate(book_id, {current_loan: null}, {new: true}, function(err, newBook) {
              if (err) res.json({ status: 'failure', message: 'Returning the book failed!' });
              else {
                  Book.populate(newBook, {path: 'bookInfo'}, function(err, newBook) {
                    BookView.transformBookToView(newBook).then((bookView) => {
                      res.json({ status: 'success', book: bookView });
                    });
                  });
              }
            })
          }
        });
      }
    });
  }
  else res.status(401).json({ status: 'failure', message: 'No authentication token supplied.' });
}


getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = { borrowBook: borrowBook, returnBook: returnBook };
