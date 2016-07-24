var express = require('express');
var router = express.Router();

// Models to be used
var Users = require('../models/user');
var Courses = require('../models/courses');
var Concepts = require('../models/concepts');
var Questions = require('../models/questions');

function requireLogin (req, res, next) {
    if (!req.session.user) {
        res.send({'status': 'ERROR', eMessage: 'Not signed in! Sign in first.'});
    } else {
        next();
    }
}

router.get('/questions', requireLogin, function(req, res, next){
    var 
});


