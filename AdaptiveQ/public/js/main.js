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
    .when('/coursedata', {
        templateUrl: 'partials/coursedata',
        controller: 'courseDataController'
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

mainApp.service('dbService', ['$http', function($http){
    
    this.getUser = function(){
        return user_client;
    };

    this.getCourseQuestions = function(){
        //$http.get all Questions that include current Course
    };

    this.postAttempt = function(){
        //$http.post an question attempt to user.records[]
    };

    this.postQuestion = function(model){
        $http.post('/api/addquestion', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                $scope.error_msg = "Question Created";
                //refresh page
            }
        }, function(error){
            console.log("Problem in Connecting to Server:");
            console.log(error);
        });  
    };

    this.postExplanation = function(){
        //$http.post an explanation to a question
    };

    this.postConcept = function(model){
        $http.post('addconcept', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                $scope.error_msg = response.eMessage;
            }
            else{
                $scope.error_msg = "Concept Added";
                //refresh page
            }
        }, function(error){
            $scope.error_msg = "Problem in connecting to server";
        });
    };

    this.getStudents = function(){
        //$http.get array of users that are in a course but not an instructor
    };

    this.changeUser = function(nameORemailORpasswordORcourses){
        //based on argument, change a property of the current user
    };
}]);

mainApp.service('courseService', ['dbService', function(dbService){
    
    //Initialize array of course objects
    this.courses = dbService.getUser().courses;

    this.currentCourse = courses[0];

    this.changeCourse = function(courseName){
        
    };

}]);

mainApp.controller('navController', ['$scope', '$http', 'dbService', function ($scope, $http, dbService) {

    var loadData = function(){
        //$scope.user = user;
        //$scope.
    };

    $scope.user = dbService.getUser();

    $scope.courses = ['Java', 'Javascript', 'Introduction To Computer Science'];

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

mainApp.controller('dashboardController', ['$scope', 'dbService', function($scope, dbService){

    // -------- Concepts Panel --------
    $scope.getConceptGreen = function(concept){
        // getConceptGreen for every student
        // find average
        return '45%';
    };
    $scope.getConceptRed = function(concept){
        //getConceptRed for every student
        //find average
        return '30%';
    };
    $scope.getConceptYellow = function(concept){
        //getConceptYellow for every student
        //find average
        return '25%';
    };



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
}]);

mainApp.controller('questionController', ['$scope', 'orderByFilter', 'dbService', function($scope, orderBy, dbService){

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
                $scope.showHint = false;
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

    $scope.enableHint = function(){
        $scope.showHint = true;
        // TODO: Record that user used a hint
        return 1;
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

mainApp.controller('askQuestionController', ['$scope', 'dbService', function($scope, dbService){
    $scope.model = {
        courseId: 1,
        text: "",
        code: "",
        options: [],
        answers: [],
        concepts: [],
        created_at: Date.now(),
        hint: "",
        explanations: [],
    };

    $scope.toggleSelection = function(answer){
        var index = $scope.model.answers.indexOf(answer);

        if(index > -1){
            // Answer was selected and needs to be removed
            $scope.model.answers.splice(index, 1);
        }else{
            $scope.model.answers.push(answer);
        }
    };

    $scope.submitQuestion = function(){
        console.log("Submitted");
        console.dir($scope.model);
        $scope.errorMsg = "";
        dbService.postQuestion($scope.model);
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

}]);

mainApp.controller('courseDataController', ['$scope', 'dbService', function($scope, dbService){
    $scope.students = students;
    $scope.student = { name: 'No Student Chosen' };
    $scope.$watch('student', function(){
        console.dir($scope.student);
        return true;
    });

    $scope.$watch('student.name', function(){
        console.log($scope.student.name);
        return true;
    });

    $scope.getConceptGreen = function(concept){
        // getConceptGreen for every student
        // find average
        return '45%';
    };

    $scope.getConceptGreen = function(concept, studentName){
        // get student from array of all students in course
        // find questions in course that include the concept
        // iterate every record with every question, checking for correct attempts
        // return correct attempts / numOfQuestionsInCourse
        return '45%';
    };

    $scope.getConceptRed = function(concept){
        //getConceptRed for every student
        //find average
        return '30%';
    };

    $scope.getConceptRed = function(concept, studentName){
        // get student from array of all students in course
        // find questions in course that include the concept
        // iterate every record with every question, checking for incorrect attempts
        // return correct attempts / numOfQuestionsInCourse
        return '30%';
    };

    $scope.getConceptYellow = function(concept){
        //getConceptYellow for every student
        //find average
        return '25%';
    };

    $scope.getConceptYellow = function(concept, studentName){
        // return 1 - (getConceptGreen() + getconceptRed())
        return '25%';
    };

    $scope.getStudentGreen = function(studentName){
        // for every concept, getConceptGreen(concept, studentName)
        // return average
        return '45%';
    };

    $scope.getStudentRed = function(){
        // for every concept, getConceptRed(concept, studentName)
        // return average
        return '30%';
    };

    $scope.getStudentYellow = function(){
        // for every concept, getConceptYellow(concept, studentName)
        // return average
        return '25%';
    };

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

    $scope.createConcept = function(){
        // Post $scope.newConcept to current course
        $scope.newConcept.courseId = 1;
        //$scope.newConcept.courseId = courseService.currentCourse.courseId;
        console.log("New Concept: " + $scope.newConcept);
        //dbService.postConcept($scope.newConcept);
        $scope.newConcept.name = '';
        $scope.conceptReady = false;
        $scope.open = false;
        return 1;
    };

}]);

mainApp.controller('accountController', ['$scope', 'dbService', function($scope, dbService){

    $scope.resetDialogs = function(){
        $scope.newName = '';
        $scope.newEmail = '';
        $scope.newPassword = '';
        $scope.confirmPassword = '';
        $scope.courseCode = '';
        $scope.courseToLeave = '';
        $scope.openChangeName = false;
        $scope.openChangeEmail = false;
        $scope.openChangePassword = false;
        $scope.openAddCourse = false;
        $scope.openDeleteCourse = false;
    };

    $scope.changeName = function(){
        $scope.errorMsg = '';
        console.log('Name Changed: ' + $scope.newName);
        //Change Name
        //Refresh
        $scope.openChangeName = false;
    };

    $scope.changeEmail = function(){
        $scope.errorMsg = '';
        console.log('Email Changed: ' + $scope.newEmail);
        //Change Email
        //Refresh
        $scope.openChangeEmail = false;
    };

    $scope.changePassword = function(){
        $scope.errorMsg = '';
        if($scope.newPassword != $scope.confirmPassword){
            $scope.errorMsg = 'Passwords do not match';
            return 0;
        }

        console.log('Password Changed: ' + $scope.newPassword);
        //Hash
        //Change Password
        //Refresh
        $scope.openChangePassword = false;
    };

    $scope.findCourse = function(){
        $scope.errorMsg = '';
        //Find Course that matches $scope.courseCode
        var courseExists = true;
        var alreadyJoined = false;
        if(!courseExists){
            $scope.errorMsg = 'No Course Found';
            return 0;
        }else if(alreadyJoined){
            $scope.errorMsg = 'Already Joined';
            return 0;
        }else{
            $scope.courseName = 'Sample Course Name';
            $scope.courseInstructors = 'Sample Instructor';
            $scope.courseFound = true;
            return 1;
        }
    };

    $scope.joinCourse = function(){
        //Add Course to user.courses
        //Refresh
        $scope.openAddCourse = false;
        return 1;
    };

    $scope.chooseCourseToLeave = function(courseName){
        $scope.resetDialogs();
        $scope.courseToLeave = courseName;
        $scope.openDeleteCourse = true;
        return 1;
    };

    $scope.leaveCourse = function(){
        //Remove $scope.courseToLeave from user.courses
        //Refresh
        $scope.openDeleteCourse = false;
        return 1;
    };
}]);

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

students = [
{
    id: 101,
    name: 'Jeff',
    attemptedCorrect: 9,
    attemptedIncorrect: 3,
    unattempted: 4,
},
{
    id: 102,
    name: 'Mary',
    attemptedCorrect: 6,
    attemptedIncorrect: 2,
    unattempted: 2,
},
{
    id: 103,
    name: 'Sally',
    attemptedCorrect: 3,
    attemptedIncorrect: 7,
    unattempted: 5,
},
{
    id: 104,
    name: 'David',
    attemptedCorrect: 3,
    attemptedIncorrect: 5,
    unattempted: 5,
},
{
    id: 105,
    name: 'Ben',
    attemptedCorrect: 5,
    attemptedIncorrect: 1,
    unattempted: 1,
},
{
    id: 106,
    name: 'Clark',
    attemptedCorrect: 2,
    attemptedIncorrect: 4,
    unattempted: 7,
},
{
    id: 107,
    name: 'Mandy',
    attemptedCorrect: 4,
    attemptedIncorrect: 2,
    unattempted: 4,
},
    ];
