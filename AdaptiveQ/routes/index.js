var express = require('express');
var router = express.Router();
var Concepts = require('../models/conceptModel');

/* ###### Dashboard functions ###### */

function findConceptByTitle(title, concepts){
  for(var i = 0; i < concepts.length; ++i)
  {
    if (concepts[i].title == title){
      return concepts[i];
    }
  }
  return null;
}

function makeTree(concept, concepts, parentTitle){
  if(!concept || concept == null) return null;
  var node = {};
  node.id = concept._id;
  node.name = concept.title;
  node.children = [];
  node.parent = parentTitle;
  if(!concept.children) return node;
  for(var i = 0; i < concept.children.length; ++i){
    var childConcept = findConceptByTitle(concept.children[i], concepts);
    var childNode = makeTree(childConcept, concepts, node.name);
    node.children.push(childNode);
  }
  return node;
}

router.get('/concepts', function(req, res, next){
  Concepts.find({}, function(err, concepts){
    if(err){
      console.log(err);
      res.send(err);
    }
    else {
      //console.log(concepts);
      var root = findConceptByTitle('Javaroot', concepts);
      var tree = makeTree(root, concepts, 'null');
      console.log(tree);
      res.send(tree);
    }
  });
});


/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session && req.session.userId){
      // show dashboard here
      res.render('dashboard');
    }
    else
    {
      res.render('login');
    }
});

router.get('/logout', function(req, res){
  req.session.userId = null;
  req.session.email = null;
  res.redirect('/');
});

module.exports = router;
