var express = require('express');
var app = express();
var mongo = require('mongoose');

// mongo.connect("52.33.119.37/adaptq_dev");
mongo.connect("52.35.105.224/adaptq_dev");
//  mongo.connect("mongodb://localhost:27017/adaptq");

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

// For session managements
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
app.use(cookieParser());
var secret = 'PgkXR<;u&G7VUL>r';
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret,
  store: new mongoStore({
    mongooseConnection: mongo.connection,
    collection: 'sessions' // default
  })
}));

console.log("App started at http://localhost:3000");


var bodyParser = require('body-parser');
var nodemailer = require("nodemailer");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(nodemailer);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var routes = require('./routes/index');
var users = require('./routes/users');
var question = require('./routes/question');
app.use('/', routes);
app.use('/users', users);
app.use('/question', question);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
