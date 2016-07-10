var mainApp = angular.module('mainApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap']);

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

                switch($scope.question.status){
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
                    return questions[i].status;
                }
            }
        }

        return '';
    } 
});

mainApp.controller('questionController', function($scope){

    $scope.questions = questions;

    $scope.model = {
      questionid: 11,
      option: ''
    };

    $scope.$watch('model.questionid', function(){

        for (var i = 0; i < $scope.questions.length; i++) {
            var currentQuestion = $scope.questions[i];

            if ($scope.model.questionid == currentQuestion.id) {
                $scope.model.option = '';
                $scope.question = questions[i];
                console.log('Question changed to:');
                console.dir($scope.question);

                return true;
            }
        }
    });


    $scope.submitanswer = function(){
      console.log("Option " + $scope.model.option + " confirmed for Question ID " + $scope.question.id);
    };
});

mainApp.controller('askQuestionController', function($scope){
    $scope.test = 'Ask Question Controller is connected.';
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
          status: 'attemptedCorrect',
          code: "var bob = 6;\nvar jake = bob;\nsteve = bob + jake;",
          options: ["hello 1", "Option 2", "goodbye 3", "Option 4"],
      },
      {
          id: 12,
          date: new Date(2016, 5, 15),
          title: "Which are valid declarations of variables?",
          concepts: "variables, primitive types",
          status: 'attemptedCorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 13,
          date: new Date(2016, 5, 16),
          title: "Which are valid declarations of variables?",
          concepts: "variables, primitive types",
          status: 'attemptedIncorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 14,
          date: new Date(2016, 5, 17),
          title: "Which are valid declarations of variables?",
          concepts: "variables, primitive types",
          status: 'attemptedCorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 15,
          date: new Date(2016, 5, 18),
          title: "Which are valid declarations of variables?",
          concepts: "variables, primitive types",
          status: 'attemptedIncorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 16,
          date: new Date(2016, 5, 19),
          title: "Which are valid declarations of variables?",
          concepts: "variables, primitive types",
          status: 'attemptedIncorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 17,
          date: new Date(2016, 5, 20),
          title: "Which are valid declarations of variables?",
          concepts: "variables, primitive types",
          status: 'unattempted',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 18,
          date: new Date(2016, 5, 21),
          title: "Which are valid declarations of variables?",
          concepts: "variables, primitive types",
          status: 'attemptedIncorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 19,
          date: new Date(2016, 5, 22),
          title: "Which are valid declarations of variables?",
          concepts: "variables, primitive types",
          status: 'attemptedCorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 110,
          date: new Date(2016, 5, 23),
          title: "Which are valid declarations of variables?",
          concepts: "variables, primitive types",
          status: 'attemptedCorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 111,
          date: new Date(2016, 5, 24),
          title: "Which are valid declarations of variables?",
          concepts: "variables, primitive types",
          status: 'attemptedCorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 112,
          date: new Date(2016, 5, 25),
          title: "Which is an incorrect constructor?",
          concepts: "constructors",
          status: 'attemptedIncorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 113,
          date: new Date(2016, 5, 26),
          title: "Which is an incorrect constructor?",
          concepts: "constructors",
          status: 'attemptedCorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 114,
          date: new Date(2016, 5, 27),
          title: "Which is an incorrect constructor?",
          concepts: "constructors",
          status: 'attemptedCorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 115,
          date: new Date(2016, 5, 28),
          title: "Which is an incorrect constructor?",
          concepts: "constructors",
          status: 'attemptedIncorrect',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 116,
          date: new Date(2016, 5, 29),
          title: "Select all proper array instantiations",
          concepts: "arrays",
          status: 'unattempted',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 117,
          date: new Date(2016, 5, 30),
          title: "Select all proper array instantiations",
          concepts: "arrays",
          status: 'unattempted',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
      {
          id: 118,
          date: new Date(2016, 6, 1),
          title: "What is the output of the following code?",
          concepts: "methods, local variables",
          status: 'unattempted',
          code: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      }
      ];
