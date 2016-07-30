var mainApp = angular.module('mainApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ngTagsInput']);

mainApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
    .when('/', {
        templateUrl: 'partials/dashboard',
        controller: 'dashboardController',
        resolve: {
            conceptsData: function(dbService, courseService){
                return dbService.getCourseConcepts(courseService.currentCourse)
                    .then(function(response){
                        return response;});
            },
            questionsData: function(dbService, courseService){
                if(!courseService.enrolled){
                    return [];
                }
                return dbService.getCourseQuestions(courseService.currentCourse)
                    .then(function(response){
                        return response;});
            },
        },
    })
    .when('/question', {
        templateUrl: 'partials/question',
        controller: 'questionController',
        resolve: {
            questionsData: function(dbService, courseService){
                return dbService.getCourseQuestions(courseService.currentCourse)
                    .then(function(response){ 
                        return response;});
            },
        },
    })
    .when('/questionsunavailable',{
        templateUrl: 'partials/questionsunavailable',
    })
    .when('/askquestion', {
        templateUrl: 'partials/askquestion',
        controller: 'askQuestionController'
    })
    .when('/coursedata', {
        templateUrl: 'partials/coursedata',
        controller: 'courseDataController',
        resolve: {
            conceptsData: function(dbService, courseService){
                return dbService.getCourseConcepts(courseService.currentCourse)
                    .then(function(response){
                        return response;});
            },
            questionsData: function(dbService, courseService){
                return dbService.getCourseQuestions(courseService.currentCourse)
                    .then(function(response){
                        return response;});
            },
            studentsData: function(dbService, courseService){
                return dbService.getCourseStudents(courseService.currentCourse)
                    .then(function(response){
                        return response;});
            },
        },
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

    this.getCourseQuestions = function(course){
        return $http.get('/api/getCourseQuestions', {params: course}).then(function(httpResponse){
            var response = httpResponse.data;
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Questions Retrieved in dbService");
                return response.data;
            }
        }, function(error){
          console.log("Problem in Connecting to Server:");
          console.log(error);
        });
    };

    this.getCourseConcepts = function(course){
        return $http.get('/api/getCourseConcepts', {params: course}).then(function(httpResponse){
            var response = httpResponse.data;
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Concepts Retrieved in dbService");
                console.log(response.data);
                return response.data;
            }
        }, function(error){
          console.log("Problem in Connecting to Server:");
          console.log(error);
        });
    };

    this.getCourseStudents = function(course){
        return $http.get('/api/getCourseStudents', {params: course}).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Students Retrieved");
                console.log(response.data);
                return response.data;
            }
        }, function(error){
          console.log("Problem in Connecting to Server:");
          console.log(error);
        });
    };

    this.postAttempt = function(model){
        $http.post('/api/postAttempt', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Attempt Posted");
                //refresh page
            }
        }, function(error){
            console.log("Problem in Connecting to Server:");
            console.log(error);
        });
    };

    this.postQuestion = function(model){
        $http.post('/api/addquestion', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Question Created");
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
        $http.post('/api/addconcept', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Concept Added");
                //refresh page
            }
        }, function(error){
            console.log("Problem in connecting to server");
        });
    };

    this.changeUser = function(nameORemailORpasswordORcourses){
        //based on argument, change a property of the current user
    };
}]);

mainApp.service('courseService', ['dbService', function(dbService){
    
    //Initialize array of course objects
    this.courses = dbService.getUser().courses;

    this.enrolled = this.courses.length > 0;

    this.currentCourse = this.courses[0];

    this.changeCourse = function(courseName){
      for(var i = 0; i < this.courses.length; i++){
        if(this.courses[i].name == courseName){
          this.currentCourse = this.courses[i];
          console.log("Course Changed:");
          console.dir(this.currentCourse);
          return 1;
        }
      }  
      console.log("Course not found");
      return 0;
    };

}]);

mainApp.controller('navController', ['$scope', '$http', 'dbService', 'courseService', function ($scope, $http, dbService, courseService) {

    $scope.user = dbService.getUser();

    $scope.courses = (courseService.enrolled) ? $scope.user.courses : [{name: "No Courses"}];

    $scope.questionRoute = function(){
        if(courseService.enrolled){
            return '/question';
        }else{
            return '/questionsunavailable';
        }
    };

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

    $scope.changeCourse = function(courseName){
        courseService.changeCourse(courseName);
    };

}]);

mainApp.controller('dashboardController', ['$scope', 'dbService', 'conceptsData', 'questionsData', function($scope, dbService, conceptsData, questionsData){

    $scope.courseExists = questionsData.length > 0;
    $scope.concepts = conceptsData;
    $scope.questions = questionsData;

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

        for (var i = 0; i < questionsHardCode.length; i++) {
            var currentDay = new Date(questionsHardCode[i].date).setHours(0,0,0,0);

            if (dayToCheck === currentDay) {
                $scope.question = questionsHardCode[i];
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
        for(var i = 0; i < recordsHARDCODE.length; i++) {
            var currentRecord = recordsHARDCODE[i];

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

            for (var i = 0; i < questionsHardCode.length; i++) {
                var currentDay = new Date(questionsHardCode[i].date).setHours(0,0,0,0);

                if (dayToCheck === currentDay) {
                    return $scope.checkStatus(questionsHardCode[i]);
                }
            }
        }

        return '';
    } 
}]);

mainApp.controller('questionController', ['$scope', 'questionsData', 'dbService', 'orderByFilter', function($scope, questionsData, dbService, orderBy){

    $scope.noQuestions = questionsData.length === 0;

    $scope.questions = (!$scope.noQuestions) ? questionsData : [{_id: '500', text: 'No Questions in Course', created_at: 'Instructor has not posted yet.', answers: [], noData: true}];

    $scope.model = {
        questionId: $scope.questions[$scope.questions.length - 1]._id,
        optionsSelected: [],
    };

    $scope.checkStatus = function(question){
        if(question.noData){
            return 'unattempted';
        }
        for(var i = 0; i < records.length; i++) {
            var currentRecord = records[i];

            if(question._id == currentRecord.questionId) {
                if(question.answers == currentRecord.optionsSelected) {
                    return 'attemptedCorrect';
                }
                return 'attemptedIncorrect';
            }
        }
        return 'unattempted';
    };

    // Question List Ordering

    $scope.order = 'Date';
    $scope.orderVal = 'date';
    $scope.reverse = true;
    $scope.reverseIcon = 'fa fa-chevron-down';

    $scope.switchReverse = function() {
        $scope.reverse = !$scope.reverse;
        $scope.reverseIcon = ($scope.reverse) ? 'fa fa-chevron-down':'fa fa-chevron-up';
    };

    $scope.sortByDate = function() {
        $scope.order = 'Date';
        $scope.orderVal = 'created_at';
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
        $scope.questions = orderBy($scope.questions, $scope.orderVal, $scope.reverse);
        $scope.explanations = orderBy(explanations, $scope.expOrderVal, true);
        console.log('Order was changed');
    });

    // Change data whenever a new question is selected from sidebar

    $scope.$watch('model.questionId', function(){
        for (var i = 0; i < $scope.questions.length; i++) {
            var currentQuestion = $scope.questions[i];

            if ($scope.model.questionId == currentQuestion._id) {
                $scope.question = currentQuestion;
                console.log('Question changed to:');
                console.dir($scope.question);

                // Reset Fields
                $scope.model.optionsSelected = [];
                $scope.showHint = false;
                $scope.showExplanations = false;
                $scope.addExplanation = false;

                // Direct to Question or Explanation
                $scope.recordExists = $scope.checkStatus($scope.question) != 'unattempted';
                $scope.multipleAnswers = ($scope.question.answers.length > 1 && false);

                // Retrieve Correct Choice and User Choice if Attempted
                if($scope.recordExists) {
                    for(var j = 0; j < records.length; j++) {
                        var currentRecord = records[j];
                        if(currentRecord.questionId == $scope.question._id){
                            $scope.correctChoices = $scope.question.answers;
                            $scope.userChoices = currentRecord.optionsSelected;
                            console.log('Correct Answer: ' + $scope.correctChoices + '; User Answer: ' + $scope.userChoices);
                        }
                    } 
                }

                return true;
            }
        }
    });

    $scope.toggleSelection = function(answer){
        var index = $scope.model.optionsSelected.indexOf(answer);

        if(index > -1){
            // Answer was selected and needs to be removed
            $scope.model.optionsSelected.splice(index, 1);
        }else{
            $scope.model.optionsSelected.push(answer);
        }
        console.log($scope.model.optionsSelected);
    };

    $scope.submitAnswer = function(){
        console.log("Options " + $scope.model.optionsSelected + " confirmed for Question ID " + $scope.question._id);
        dbService.postAttempt($scope.model);
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
        console.log($scope.model.answers);
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

mainApp.controller('courseDataController', ['$scope', '$route', 'dbService', 'courseService', 'conceptsData', 'questionsData', 'studentsData', function($scope, $route, dbService, courseService, conceptsData, questionsData, studentsData){
    $scope.course = courseService.currentCourse;
    $scope.questions = questionsData;
    $scope.concepts = conceptsData;
    $scope.students = studentsData;
    $scope.student = { name: 'No Student Chosen' };

    $scope.$watch('student', function(){
        console.log($scope.student.name);
        console.dir($scope.student);
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
        // iterate every record with every question, checking for incorrect attempts
        // return correct attempts / numOfQuestionsInCourse
        return '45%';
    };


    $scope.getStudentConceptBar = function(concept){
        // get student from array of all students in course
        // find questions in course that include the concept
        // iterate every record with every question, checking for correct attempts
        // return correct attempts / numOfQuestionsInCourse
        if($scope.student.name == 'No Student Chosen'){ return 0; }
        var correct = 0;
        var incorrect = 0;
        var courseAttempts = [];
        var questionCount = 0;
        for(var i = 0; i < $scope.student.attempts.length; i++){
            var attempt = $scope.student.attempts[i];
            if(attempt.courseId == $scope.course._id){
                courseAttempts.push(attempt);
            }
        }
        for(var j = 0; j < $scope.questions.length; j++){
            var question = $scope.questions[j];
            console.dir(question);
            console.log(concept);
            if(question.concepts.indexOf(concept) > -1){
                questionCount++;
                for(var k = 0; k < courseAttempts.length; k++){
                    var courseAttempt = courseAttempts[k];
                    if(courseAttempt.questionId == question._id){
                        console.log("Score: " + courseAttempt.score + "counted for " + concept);
                        if(courseAttempt.score == 1){
                            correct++;
                        }else{
                            incorrect++;
                        }
                        break;
                    }
                }
            }
        }

        var percentages = [
            correct / questionCount,
            incorrect/ questionCount,
        ];
        percentages.push(1 - (percentages[0] + percentages[1]));
        console.log(concept + " : " + percentages);

        return questionCount;
    };

    $scope.getConcept = function(index){
        return $scope.concepts[index];
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
        $scope.newConcept.courseId = courseService.currentCourse._id;
        console.log("New Concept: ");
        console.dir($scope.newConcept);
        var storeConcept = $scope.newConcept;
        dbService.postConcept(storeConcept);
        $route.reload();
        $scope.conceptReady = false;
        $scope.open = false;
        return 1;
    };

}]);

mainApp.controller('accountController', ['$scope', 'dbService', function($scope, dbService){

    $scope.user = dbService.getUser();
    console.log($scope.courses);

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

records = [
{
    questionId: 0,
    optionsSelected: [0],
},
{
    questionId: 1,
    optionsSelected: [1],
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
