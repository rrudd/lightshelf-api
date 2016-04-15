var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var config = require('../../config');
var jwt = require('jwt-simple');
var router = express.Router();

router.post('/register', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({ message: 'Please pass a username and password.' });
  } else {
    var user = new User({
      fullname: req.body.fullname,
      username: req.body.username,
      password: req.body.password
    });
    user.save(function(err) {
      if (err) res.status(409).json({ err });
      else {
        var newUser = { username: user.username, fullname: user.fullname };
        res.status(201).json({ message: 'Registration successful.', user: newUser});
      }
    });
  }
});

router.post('/login', function(req, res) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.status(401).send({ message: 'Authentication failed. User not found.'});
    } else {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          var payload = {
            username: user.username,
            fullname: user.fullname,
            id: user._id
          };
          var token = jwt.encode(payload, config.secret);
          res.status(200).json({ token: token, user: payload });
        } else {
          res.status(401)
            .send({ message: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

module.exports = router;
