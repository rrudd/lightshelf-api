var express = require('express');
var router = express.Router();
var Book = require('../models/book');
var Loan = require('../models/loan');
var passport = require('passport');
var loanController = require('../controllers/loan-controller')
var bookController = require('../controllers/book-controller');

router.route('/')

  //Add new book to library
  .post(function(req, res) {
    bookController.saveBook(req, res);
  })

  //Get all books in library
  .get(function(req, res) {
    if (req.isAuthenticated()) {
      bookController.getAllBooks(req, res);
    }
  });

router.route('/find')

  .get(function(req, res) {
    if(req.isAuthenticated()) {
      bookController.findBook(req, res);
    }
    else res.status(401).json({ error: 'Not logged in.' });
  });

router.route('/:book_id')

  //Get a single book by _id
  .get(function(req, res) {
    Book.findById(req.params.book_id, function(err, book) {
      if (err) res.json({ message: 'No such book' });
      if (book) res.json(book);
    });
  })

  //Remove a book from the library
  .delete(function(req, res) {
    if(req.isAuthenticated()) {
      bookController.deleteBook(req, res);
    }
    else res.status(401).json({ error: 'Not logged in.' });
  });

router.route('/:book_id/loans')

  //Get all loans
  .get(function(req,res) {
    Loan.find({book_id: req.params.book_id}, function(err, loans) {
      if (err) res.send(err);
      else res.json(loans);
    });
  })

  //Add new loan
  .post(function(req, res) {
    loanController.borrowBook(req, res);
  });

router.route('/:book_id/loans/:loan_id/return')

  // Return a borrowed book
  .post(function(req, res) {
    loanController.returnBook(req, res);
  });

module.exports = router;
