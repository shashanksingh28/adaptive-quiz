var express = require('express');
var router = express.Router();
var Concepts = require('../models/concept');
var Users = require('../models/user');

router.get('/', function(req, res, next) {
    if(req.session && req.session.user){
        Users.getUserById(req.session.user._id)
            .then(function(user){
                res.render('layout', { user_server : user } );
            }, function (error){
                res.send({'status': 'ERROR', 'eMessage': error });
            });
    }
    else
    {
        res.render('login',{Message: ''});
    }
});

router.get('/resetPaswword', function(req, res){
    var token = req.query.token;
    Users.getUserForToken(token)
    .then(function(user){
        if(user){
            res.render('pwrecovery',{userEmail: user.email, userToken: token});
        }
        else{
            res.send({status: 'ERROR', eMessage: 'Invalid Token'});
        }
    }, function(error){
        console.log(error);
    });
});

router.get('/partials/:name', function (req, res){
    var name = req.params.name;
    // console.log('partials/' + name);
    res.render('partials/' + name);
});

module.exports = router;
