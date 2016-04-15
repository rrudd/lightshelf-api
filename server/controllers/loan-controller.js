var Book = require('../models/book');
var Loan = require('../models/loan');
var config = require('../../config.js');
var jwt = require('jwt-simple');

borrowBook = function(req, res) {
  var book_id = req.params.book_id;
  var token = getToken(req.headers);

  // Check that the user exists
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    user_id = decoded.id;
    user_name = decoded.fullname;

    // Check that the book exists
    Book.findById(book_id, function(err, book) {

      // Check if there's already an active loan for this book
      Loan.findOne({ book: book._id, active: true }, function(err, loan) {
        if (loan) res.json({ status: 'failure', message: 'Book is not available.' });
        else {
          var new_loan = new Loan();
          new_loan.book = book_id;
          new_loan.user = user_id;
          new_loan.save(function(err, loan) {
            if (err) res.json({ status: 'failure', message: 'Borrowing the book failed.' });
            else {
              Book.findByIdAndUpdate(book_id, {current_loan: loan._id}, {new: true}, function(err, newBook) {
                res.json({ status: 'success', book: newBook });
              });
            }
          });
        }
      });
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
              else res.json({ status: 'success', book: newBook });
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
