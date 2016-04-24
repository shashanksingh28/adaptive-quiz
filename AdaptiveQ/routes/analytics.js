var express = require('express');
var router = express.Router();
var Concepts = require('../models/conceptModel');
var User = require('../models/userModel');
var cossimilarity = require( 'compute-cosine-similarity' );

function requireLogin (req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
  } else {
    next();
  }
};

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
router.get('/getConceptTree', requireLogin, function(req, res, next){
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
  var minAbs = 0;
  var closestUser = null;
  var userData = {};
  var simScore = [];
  var sessionUserMean = 0.0;
  for (var userId in usersScores) {    
    if (usersScores.hasOwnProperty(userId)) {     
        if(userId != user._id)
        {
          var currentUserData = []
          var sessionUserData = []
          var hasScoreFor = []
          var sessionUserm = 0.0;
          var sessionNo = 0;
          var currentUserm = 0.0;
          var currentNo = 0;
          for(var key in usersScores[userId])
          {            
            if(usersScores[userId].hasOwnProperty(key))
            {
              var userScore = usersScores[user._id][key];
              var score = usersScores[userId][key];

              if(score != -1){
                currentUserm += score;
                currentNo += 1;

              }
              if(userScore != -1){
                sessionUserm += userScore;
                sessionNo += 1;
              }
              if (score != -1 && userScore != -1){               
                currentUserData.push(score);
                sessionUserData.push(userScore);
                //totalScore += score;
              }
              else if(score != -1 && userScore == -1){
                hasScoreFor.push({"key" : key, "score" : score});

              }
            }
          }
          //console.log( "the currentUser" + currentUserData + "the sessionUserData" + sessionUserData);
          var s = cossimilarity( currentUserData, sessionUserData );
          //console.log("the similarity score is" + s);
          //console.log("total for" + userId + "is" + currentUserm + "no of" + currentNo );
          userData[userId] = {"score":s, "hasScoreFor" : hasScoreFor, "mean" : currentUserm/currentNo};
          sessionUserMean = sessionUserm/sessionNo;
          simScore.push({"key": userId, "value": s});
        }
    }
  }
  //console.log("total for" + user._id + "is mean" + sessionUserMean);
  //console.log(simScore);
  simScore.sort(function(a, b){
    return b.value - a.value;
  });
  //console.log("sorted are " + simScore);
  //console.log(simScore);
  //console.log(userData);
  recommendation = {};
  recommendationBy = {};
  for (var i = 0 ; i < 2 ; i++) {
    uid = simScore[i].key;
    userCurr = userData[uid];
    //console.log(userCurr);
    for (var j = 0 ; j < userCurr.hasScoreFor.length; j++){

      sc = userCurr.score * (userCurr.hasScoreFor[j].score - userCurr.mean) ;
      if (recommendation.hasOwnProperty(userCurr.hasScoreFor[j].key)){
        recommendation[userCurr.hasScoreFor[j].key] += sc;
        recommendationBy[userCurr.hasScoreFor[j].key].push(userCurr.score);
      }
      else
      {
        recommendation[userCurr.hasScoreFor[j].key] = sc;
        recommendationBy[userCurr.hasScoreFor[j].key] = [userCurr.score];
      }

      //console.log(sc);

    }
    //console.log("each iteration later");
    //console.log(recommendation);

  };
  //console.log("recommendation");
  //console.log(recommendation);
  //console.log(recommendationBy);

  for (var key in recommendation) {
  if (recommendation.hasOwnProperty(key)) {
    var deno = 0.0;
    for (var i = 0; i < recommendationBy[key].length; i++) {
      deno += recommendationBy[key][i];
    };
    recommendation[key] = sessionUserMean + (recommendation[key]/deno)
  }
}

console.log(recommendation);

//return userData;
return recommendation;
}



router.get('/getScoreAnalytics', requireLogin, function(req,res, next){
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
      response['predictedScores'] = getNearestNeighbor(req.session.user,usersScores);
      res.send(response);
    });
  });
});

function getMean(data){
  var meandate = {  };
  for (var i = 0; i < data.length; i++) {
    var d = data[i].attemptAt;
    var da = new Date(d);
    console.log(da);
    var dat = da.getDate();
    var mon = da.getMonth() + 1;
    var yr = da.getFullYear();
    date = ""+ mon+ dat + yr;
    console.log(date);
    if (meandate.hasOwnProperty(date)){
      console.log("in if")
      console.log(meandate);
      console.log(meandate[date].mean);
      console.log(meandate[date].num);
      console.log(data[i].score);
      meandate[date].mean += data[i].score;
      meandate[date].num += 1;
      console.log("in if")
    }
    else{
      console.log("in else")
      meandate[date] = {
      mean : data[i].score,
      num  : 1       } ;
      
    }
  };
  console.log("meandate is")
  console.log(meandate);
  finalmean = {};
  for (var key in meandate) {
    for (var keyin in meandate) {
      if (parseInt(keyin) < parseInt(key)){

        meandate[key].mean += meandate[keyin].mean;
        meandate[key].num += meandate[keyin].num;

      }
    
    
  }
  //console.log("done inner for");
  //console.log( meandate);
    finalmean[key] = meandate[key].mean/meandate[key].num;
  }

  console.log(finalmean);
  return finalmean;
}

router.get('/mean', function(req, res, next) {
    if(req.session && req.session.user){
      // show dashboard here
      console.log(req.session.user._id);
    User.getUserById(req.session.user._id)
    .then(function(users){
      MeanData = users.records;
      console.log(MeanData);
      DayMeanData = getMean(MeanData);
      res.send(DayMeanData);

      },function (err){
          console.log("error in update explaination" + err);
        });


    }
    else
    {
      res.render('login');
    }
});

module.exports = router;
