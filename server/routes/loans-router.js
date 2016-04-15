var express = require('express');
var passport = require('passport');
var router = express.Router();
var Loan = require('../models/loan');
var Book = require('../models/book');
var loanController = require('../controllers/loan-controller')

router.route('/')

  //Get all loans
  .get(function(req,res) {
    Loan.find(function(err, loans) {
      if (err) res.send(err);
      else res.json(loans);
    });
  })

  //Add new loan
  .post(passport.authenticate('jwt', { session: false }), function(req, res) {
    loanController.borrowBook(req, res);
  });

router.route('/:book_id')

  .put(passport.authenticate('jwt', { session: false }), function(req, res) {
    var book_id = req.params.book_id;
    Loan.findOne({ book: book_id , active: true }, function(err, loan) {
      if (err) res.send(err);
      else {
        loan.active = false;
        loan.save(function(err) {
          if (err) res.json({ message: 'Returning the book failed!' });
          else {
            Book.findById(book_id, function(err, book) {
              book.currentLoan.active = false;
              book.save(function(err) {
                if (err) res.json({ message: 'Returning the book failed!' });
                else res.json({ message: 'Book returned successfully!' });
              })
            });
          }
        });
      }
    });
  });

  module.exports = router;
