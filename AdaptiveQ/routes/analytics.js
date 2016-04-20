var express = require('express');
var router = express.Router();
var Concepts = require('../models/conceptModel');
var User = require('../models/userModel');

// Get the mean score of the user only for this concept
function getUserConceptMean(concept, user){
  var total = 0;
  var count = 0;
  for(var i = 0; i < user.records.length; ++i){
    if (user.records[i].concept == concept){
      total += user.records[i].score;
      count += 1;
    }
  }
  // If no record, return -1
  if (count == 0)
    return -1;

  return total / count;
}

// same as above with plural
function getUsersConceptMean(concept, users){
  var total = 0;
  var count = 0;
  for(var i = 0; i < users.length; ++i){
    for(var j = 0; j < users[i].records.length; ++j){
      if (users[i].records[j].concept == concept){
        total += users[i].records[j].score;
        count += 1;
      }
    }
  }

  if (count == 0)
    return -1;

  return total / count;
}

// users concept mean score
function getConceptNodeMeanScore(node, user){
  var score = getUserConceptMean(node.name, user);
  var count = 0;
  // count score for this node only if attempted
  if (score != -1){
    count = 1;
  }
  else{
    score = 0;
  }

  for (var i = 0; i < node.children.length; ++i){
    var childNode = getConceptNodeMeanScore(node.children[i], user);
    // only include attempted children
    if (childNode.mScore != -1)
    {
      score += childNode.mScore;
      count += 1;
    }
  }

  if (count != 0){
    node.mScore = score / count;
  }
  else {
    node.mScore = -1;
  }
  return node;
}

// same as above for class
function getClassNodeMeanScore(node, users){
  var score = getUsersConceptMean(node.name, users);
  var count = 1;
  for (var i = 0; i < node.children.length; ++i){
    for(var j = 0; j < users.length; ++j)
    {
      var childNode = getClassNodeMeanScore(node.children[i], users);
      if (childNode.mScore != -1)
      {
        score += childNode.mScore;
        count += 1;
      }
    }
  }

  if (count != 0){
    node.mScore = score / count;
  }
  else {
    node.mScore = -1;
  }
  return node;
}

// user gets his tree with scores and teacher gets class tree
router.get('/getConceptTree', function(req, res, next){
    Concepts.getConceptTree(function (conceptTree){
      if (!req.session.isTeacher)
      {
        User.getUserByEmail(req.session.user.email)
          .then(function (user){
            var treeWithScore = getConceptNodeMeanScore(conceptTree, user);
            res.send(treeWithScore);
          }, function (err){console.log("Error fetching user");});
      }
      else {
        User.getAllUsers()
          .then(function (users){
            var treeWithScore = getClassNodeMeanScore(conceptTree, users);
            res.send(treeWithScore);
          }, function (err){console.log("Error fetching users");})
      }
    });
});

module.exports = router;
