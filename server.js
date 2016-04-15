var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('jwt-simple');

var authRouter = require('./server/routes/auth-router');
var booksRouter = require('./server/routes/books-router');
var loansRouter = require('./server/routes/loans-router');
var indexRouter = require('./server/routes/index-router');

var User = require('./server/models/user');
var config = require('./config.js');
var port = process.env.PORT || 3333;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev'));

app.use(passport.initialize());

// Mongoose confuguration (MongoLabs)
mongoose.connect(config.database, function(err){
    if (err) console.log(err);
});


require('./server/auth/passport-strategy')(passport);
// router.get('/api', function(req, res) {
//   res.json({message: 'Welcome to the Lightshelf API!'});
// });

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT");
  if(req.method === 'OPTIONS') {
      res.send(200);
      return;
  }
  next();
});

app.use('/api', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/books', passport.authenticate('jwt', { session: false }), booksRouter);
// app.use('/api/loans', passport.authenticate('jwt', { session: false }), loansRouter);
app.listen(port);
require('util').log('Library hosted on port ' + port);
