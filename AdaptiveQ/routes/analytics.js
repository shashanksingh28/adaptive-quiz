var express = require('express');
var router = express.Router();
var Concepts = require('../models/conceptModel');
var User = require('../models/userModel');
var cossimilarity = require( 'compute-cosine-similarity' );

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

//############## Concept Tree Functions ##############

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

//######## User Score Matrix related functions ########

function getUserPercentile(user, usersScores){
  //First get users total
  var userTotalScore = 0;
  for (var userId in usersScores) {
    //console.log("Checking for userId:"+user._id);
    if (usersScores.hasOwnProperty(userId)) {
        if(userId == user._id)
        {
          for(var key in usersScores[userId])
          {
            if(usersScores[userId].hasOwnProperty(key))
            {
              var score = usersScores[userId][key];
              if (score != -1)
                userTotalScore += score;
            }
          }
          //console.log(userId+" : "+userTotalScore);
          break;
        }
    }
  }

  var totalCount = 1;
  var above  = 0;
  for (var userId in usersScores) {
    if (usersScores.hasOwnProperty(userId)) {
        if(userId != user._id)
        {
          totalCount += 1;
          var totalScore =  0;
          for(var key in usersScores[userId])
          {
            if(usersScores[userId].hasOwnProperty(key))
            {
              var score = usersScores[userId][key];
              if (score != -1)
                totalScore += score;
            }
          }
          if(totalScore > userTotalScore){
            above += 1;
          }
        }
    }
  }
  //console.log("above:"+above+ " total : "+ totalCount);
  var abovePercent = above / totalCount * 100;
  return 100 - abovePercent;
}


function getSimilarity(usersScores)
{
  console.log("in getSimilarity");
  var x = [ 5, 23, 2, 5, 9 ],
  y = [ 3, 21, 2, 5, 14 ];
 
var s = cossimilarity( x, y );
console.log("in getSimilarity" + s);
return s;
}

function getNearestNeighbor(user, usersScores){
  console.log("in getNearestNeighbor");
  var minAbs = 0;
  var closestUser = null;
  var userData = [];
  console.log("in getNearestNeighbor for");
  for (var userId in usersScores) {
    console.log(userId);
    if (usersScores.hasOwnProperty(userId)) {
      console.log("loop in" + userId + "session id" + user._id)
        if(userId != user._id)
        {
          var currentUserData = []
          var sessionUserData = []
          for(var key in usersScores[userId])
          {
            console.log("for key" + key);
            if(usersScores[userId].hasOwnProperty(key))
            {
              var userScore = usersScores[user._id][key];
              var score = usersScores[userId][key];
              if (score != -1 && userScore != -1){
                console.log("matched the key is" + key);
                currentUserData.push(score);
                sessionUserData.push(userScore);
                //totalScore += score;
              }                
            }
          }
          console.log( "the currentUser" + currentUserData + "the sessionUserData" + sessionUserData);
          var s = cossimilarity( currentUserData, sessionUserData );
          console.log("the similarity score is" + s);
          userData.push({"id" : userId, "score":s});

        }
    }
  }
  console.log(userData);
  return userData;
}



router.get('/getScoreAnalytics', function(req,res, next){
  Concepts.getAllConcepts()
  .then(function (allConcepts){
    User.getAllUsers()
    .then(function (allUsers){
      var currentUser = null;
      var usersScores = {};
      for(var i = 0; i < allUsers.length; ++i){
        var obj = {};
        // Get current user
        if (allUsers[i]._id == req.session.user._id){
          currentUser = allUsers[i];
        }
        for(var j = 0; j < allConcepts.length; ++j){
          var key = allConcepts[j].title;
          var value = getUserConceptMean(key, allUsers[i]);
          obj[key] = value;
        }
        usersScores[allUsers[i]._id] = obj;
      }
      response={};
      response['allScores'] = usersScores;
      response['userPercentile'] = getUserPercentile(currentUser, usersScores);
      response['similarity rank'] = getNearestNeighbor(req.session.user,usersScores);
      res.send(response);
    });
  });
});

module.exports = router;
