var mainApp = angular.module('mainApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ngTagsInput']);

mainApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
       $routeProvider
       .when('/', {
       templateUrl: 'partials/dashboard',
       controller: 'dashboardController'
       })
       .when('/question', {
       templateUrl: 'partials/question',
       controller: 'questionController'
       })
       .when('/askquestion', {
       templateUrl: 'partials/askquestion',
       controller: 'askQuestionController'
       })
       .when('/classdata', {
       templateUrl: 'partials/classdata',
       controller: 'classDataController'
       })
       .when('/myaccount', {
       templateUrl: 'partials/myaccount',
       controller: 'accountController'
       })
       .otherwise({
       redirectTo: '/'
       });

       $locationProvider.html5Mode(true);
}]);

mainApp.run(['$route', function(){}]);

mainApp.controller('navController', ['$http', '$scope', function ($http, $scope) {
    $scope.message = "angularjs is connected";

    $scope.logout = function(){
        console.log("Logging out");
        $http.get('/logout')
            .then(function(successResponse){
                $scope.message = "Logging out";
                console.log(successResponse);
            }, function(error){
                $scope.message = "Failed to log out";
            }
            );
    };
}]);

mainApp.controller('dashboardController', function($scope){

    // -------- Question Panel --------
    noquestion = {
        date: '',
        title: "-",
        concepts: "",
        status: 'No Question'
    };

    $scope.$watch('dt', function(){
        console.log("Date has changed to " + $scope.dt);
        var dayToCheck = new Date($scope.dt).setHours(0,0,0,0);

        for (var i = 0; i < questions.length; i++) {
            var currentDay = new Date(questions[i].date).setHours(0,0,0,0);

            if (dayToCheck === currentDay) {
                $scope.question = questions[i];
                console.log("Date with Question Found");

                switch($scope.checkStatus($scope.question)){
                    case 'attemptedCorrect':
                        $scope.prettyStatus = "Attempted Correctly";
                        break;
                    case 'attemptedIncorrect':
                        $scope.prettyStatus = "Attempted Incorrectly";
                        break;
                    case 'unattempted':
                        $scope.prettyStatus = "Not Yet Attempted";
                        break;
                    default:
                        $scope.prettyStatus = "Status Not Found";
                }

                return true;
            }
        }
        $scope.question = noquestion;
        $scope.prettyStatus = $scope.question.status;
        console.log("Date has No Question");
    });

    $scope.checkStatus = function(question){
        for(var i = 0; i < records.length; i++) {
            var currentRecord = records[i];

            if(question.id == currentRecord.questionid) {
                if(question.answer == currentRecord.choice) {
                    return 'attemptedCorrect';
                }
                return 'attemptedIncorrect';
            }
        }
        return 'unattempted';
    };


    // TODO: Route to Question View with question data
    $scope.goToQuestion = function(){
        console.log("Data to be Sent: ");
        console.log($scope.question);
    };

    // Set Today, Options, and Custom Classes
    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.options = {
        customClass: getDayClass,
        maxDate: new Date(),
        showWeeks: false
    };

    function getDayClass(data) {
        var date = data.date,
        mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0,0,0,0);

            for (var i = 0; i < questions.length; i++) {
                var currentDay = new Date(questions[i].date).setHours(0,0,0,0);

                if (dayToCheck === currentDay) {
                    return $scope.checkStatus(questions[i]);
                }
            }
        }

        return '';
    } 
});

mainApp.controller('questionController', ['$scope', 'orderByFilter', function($scope, orderBy){

    $scope.questions = questions;
    $scope.order = 'Date';
    $scope.orderVal = 'date';
    $scope.reverse = true;
    $scope.reverseIcon = 'fa fa-chevron-down';

    $scope.model = {
      questionid: 11,
      option: ''
    };

    $scope.switchReverse = function() {
        $scope.reverse = !$scope.reverse;
        $scope.reverseIcon = ($scope.reverse) ? 'fa fa-chevron-down':'fa fa-chevron-up';
    };

    $scope.sortByDate = function() {
        $scope.order = 'Date';
        $scope.orderVal = 'date';
    };

    $scope.sortByStatus = function() {
        $scope.order = 'Status';
        $scope.orderVal = function(question){
          var statusString = $scope.checkStatus(question);
          switch (statusString){
            case 'attemptedCorrect':
              return 0;
            case 'attemptedIncorrect':
              return 1;
            case 'unattempted':
              return 2;
          }
        };
    };

    $scope.$watchGroup(['orderVal', 'reverse', 'expOrderVal'], function(){
        $scope.questions = orderBy(questions, $scope.orderVal, $scope.reverse);
        $scope.explanations = orderBy(explanations, $scope.expOrderVal, true);
        console.log('Order was changed');
    });

    $scope.checkStatus = function(question){
        for(var i = 0; i < records.length; i++) {
            var currentRecord = records[i];

            if(question.id == currentRecord.questionid) {
                if(question.answer == currentRecord.choice) {
                    return 'attemptedCorrect';
                }
                return 'attemptedIncorrect';
            }
        }
        return 'unattempted';
    };

    // Change data whenever a new question is selected from sidebar
    $scope.$watch('model.questionid', function(){
        for (var i = 0; i < $scope.questions.length; i++) {
            var currentQuestion = $scope.questions[i];

            if ($scope.model.questionid == currentQuestion.id) {
                $scope.question = currentQuestion;
                console.log('Question changed to:');
                console.dir($scope.question);

                // Reset Fields
                $scope.model.option = '';
                $scope.howHint = false;
                $scope.showExplanations = false;
                $scope.addExplanation = false;

                // Direct to Question or Explanation
                $scope.recordExists = $scope.checkStatus($scope.question) != 'unattempted';

                // Retrieve Correct Choice and User Choice if Attempted
                if($scope.recordExists) {
                    for(var j = 0; j < records.length; j++) {
                        var currentRecord = records[j];
                        if(currentRecord.questionid == $scope.question.id){
                            $scope.correctChoice = $scope.question.answer;
                            $scope.userChoice = currentRecord.choice;
                            console.log('Correct Answer: ' + $scope.correctChoice + '; User Answer: ' + $scope.userChoice);
                        }
                    } 
                }

                return true;
            }
        }
    });


    $scope.submitAnswer = function(){
      console.log("Option " + $scope.model.option + " confirmed for Question ID " + $scope.question.id);
    };

    // Explanations
    $scope.expOrderVal = 'votes';
    $scope.explanations = orderBy(explanations, $scope.expOrderVal, true);

    $scope.expSortDate = function() {
        $scope.expOrderVal = 'dateCreated';
    };

    $scope.expSortVotes = function() {
        $scope.expOrderVal = 'votes';
    };


}]);

mainApp.controller('askQuestionController', function($http, $scope){
    $scope.model = {
        question: "",
        code: "",
        options: [],
        answer: [],
        hint: "",
        concepts: [],
    };
    
    $scope.loadConcepts = function(query){
        var matches = [];
        for(var i = 0; i < validConcepts.length; i++){
            var concept = validConcepts[i];
            var match = concept.indexOf(query);
            if(match != -1){
                matches.push(concept);
            }
        }

        console.log("Matches: " + matches);

        return matches;
    };

    validConcepts = [
        'variables',
        'objects',
        'primitive types',
        'static methods',
        'instance variables',
        'if-else statements',
        'classes',
        'switch statements',
        'logical operators',
        'data structures',
    ];


    $scope.submit = function(){
        if($scope.model.answer.length === 0){
            console.log("Please choose answers");
            return false;
        }
        console.log("Question Created");
        console.dir($scope.model);
    };
});

mainApp.controller('classDataController', function($scope){
    $scope.test = 'Class Data Controller is connected.';
});

mainApp.controller('accountController', function($scope){
    $scope.test = 'Account Controller is connected.';
});

questions = [
    {
        id: 11,
        date: new Date(2016, 5, 14),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "var bob = 6;\nvar jake = bob;\nsteve = bob + jake;",
        options: ["Your Wrong Choice", "Correct Answer", "Option 3", "Option 4"],
        hint: "This is a hint for 06/14/2016",
        answer: 1,
    },
    {
        id: 12,
        date: new Date(2016, 5, 15),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "",
        options: ["Option 1", "Correct Answer", "Option 3", "Your Wrong Answer"],
        hint: "This is a hint for 06/15/2016",
        answer: 1,
    },
    {
        id: 13,
        date: new Date(2016, 5, 16),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "",
        options: ["Option 1", "Your Correct Answer", "Option 3", "Option 4"],
        answer: 1,
    },
    {
        id: 14,
        date: new Date(2016, 5, 17),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: 1,
    },
    {
        id: 15,
        date: new Date(2016, 5, 18),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: 1,
    },
    {
        id: 16,
        date: new Date(2016, 5, 19),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 17,
        date: new Date(2016, 5, 20),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 18,
        date: new Date(2016, 5, 21),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 19,
        date: new Date(2016, 5, 22),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 110,
        date: new Date(2016, 5, 23),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 111,
        date: new Date(2016, 5, 24),
        title: "Which are valid declarations of variables?",
        concepts: "variables, primitive types",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 112,
        date: new Date(2016, 5, 25),
        title: "Which is an incorrect constructor?",
        concepts: "constructors",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 113,
        date: new Date(2016, 5, 26),
        title: "Which is an incorrect constructor?",
        concepts: "constructors",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 114,
        date: new Date(2016, 5, 27),
        title: "Which is an incorrect constructor?",
        concepts: "constructors",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 115,
        date: new Date(2016, 5, 28),
        title: "Which is an incorrect constructor?",
        concepts: "constructors",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 116,
        date: new Date(2016, 5, 29),
        title: "Select all proper array instantiations",
        concepts: "arrays",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 117,
        date: new Date(2016, 5, 30),
        title: "Select all proper array instantiations",
        concepts: "arrays",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    },
    {
        id: 118,
        date: new Date(2016, 6, 1),
        title: "What is the output of the following code?",
        concepts: "methods, local variables",
        code: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        hint: "This is a hint.",
        answer: 1,
    }
];

records = [
    {
        questionid: 11,
        choice: 0,
    },
    {
        questionid: 12,
        choice: 3,
    },
    {
        questionid: 13,
        choice: 1,
    },
    {
        questionid: 14,
        choice: 2,
    },
    {
        questionid: 15,
        choice: 2,
    },
    {
        questionid: 17,
        choice: 1,
    },
    {
        questionid: 18,
        choice: 0,
    },
    {
        questionid: 19,
        choice: 1,
    },
    {
        questionid: 110,
        choice: 1,
    },
    {
        questionid: 113,
        choice: 2,
    },
    {
        questionid: 115,
        choice: 1,
    },
];

explanations = [
    {
        user: 'Fred',
        dateCreated: new Date(2016, 06, 09, 06, 31),
        text: 'Hello. I am a Fred and this is my explanation.',
        votes: 2,
    },
    {
        user: 'Jeff',
        dateCreated: new Date(2016, 06, 10, 10, 29),
        text: 'Hello. I am a Jeff and this is my high-rated explanation.',
        votes: 9,
    },
    {
        user: 'Alice',
        dateCreated: new Date(2016, 06, 11, 15, 03),
        text: 'Hello. I am a Alice and this is my long explanation. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quam ante, pharetra imperdiet tempus at, feugiat non lorem. Mauris neque mauris, sollicitudin a sodales ut, mattis in erat. Sed fringilla, lorem at eleifend luctus, enim diam varius leo, quis auctor purus lectus accumsan nulla.',
        votes: 0,
    },
    {
        user: 'Sally',
        dateCreated: new Date(),
        text: 'Hello. I am a Sally and this is my most recent explanation.',
        votes: 0,
    },
    {
        user: 'Alexander',
        dateCreated: new Date(2016, 06, 11, 12, 0),
        text: 'Hello. I am a Alexander and this is my explanation.',
        votes: 0,
    },
];
