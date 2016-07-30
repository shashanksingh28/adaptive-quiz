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
        controller: 'askQuestionController',
        resolve: {
            conceptsData: function(dbService, courseService){
                return dbService.getCourseConcepts(courseService.currentCourse)
                    .then(function(response){
                        return response;});
            },
        },
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
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
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

    this.postExplanation = function(){
        //$http.post an explanation to a question
    };

    this.postUserUpdate = function(model){
        $http.post('/api/postUserUpdate', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("User Updated");
                //refresh page
            }
        }, function(error){
            console.log("Problem in connecting to server");
        });
    };

}]);

mainApp.service('courseService', ['$window', 'dbService', function($window, dbService){
    
    this.courses = dbService.getUser().courses;

    this.enrolled = this.courses.length > 0;

    this.currentCourse = this.courses[0];

    this.changeCourse = function(courseName){
      for(var i = 0; i < this.courses.length; i++){
        if(this.courses[i].name == courseName){
          this.currentCourse = this.courses[i];
          $window.location.href = '/';
          $window.location.reload(true);
        }
      }  
      console.log("Course not found");
    };

}]);

mainApp.service('statusService', ['dbService', function(dbService){
    
    this.checkStatus = function(question){
        if(question.noData){
            return 'unattempted';
        }
        var attempts = dbService.getUser().attempts;
        for(var i = 0; i < attempts.length; i++){
            var currentAttempt = attempts[i];
            if(question._id == currentAttempt.questionId){
                if(currentAttempt.score == 1){return 'attemptedCorrect';}
                return 'attemptedIncorrect';
            }
        }
        return 'unattempted';
    };

}]);

mainApp.controller('navController', ['$scope', '$http', '$window', 'dbService', 'courseService', function ($scope, $http, $window, dbService, courseService) {

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
        $http.get('/api/logout')
            .then(function(successResponse){
                $scope.message = "Logging out";
                console.log(successResponse);
                $window.location.href = '/';
                $window.location.reload(true);
            }, function(error){
                console.log("Failed to log out");
            }
            );
    };

    $scope.changeCourse = function(courseName){
        courseService.changeCourse(courseName);
    };

}]);

mainApp.controller('dashboardController', ['$scope', 'dbService', 'statusService', 'conceptsData', 'questionsData', function($scope, dbService, statusService, conceptsData, questionsData){

    $scope.courseExists = questionsData.length > 0;
    $scope.concepts = conceptsData;
    $scope.questions = questionsData;
    $scope.attempts = dbService.getUser().attempts;

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
        concepts: "",
    };

    $scope.$watch('dt', function(){
        var dayToCheck = new Date($scope.dt).setHours(0,0,0,0);
        for(var i = 0; i < questions.length; i++){
            var currentDay = new Date($scope.questions[i].date).setHours(0,0,0,0);
            if (dayToCheck === currentDay) {
                $scope.question = $scope.questions[i];
                return true;
            }
        }
        $scope.question = noquestion;
        console.log("Date has No Question");
    });

    // TODO: Route to Question View with question data
    $scope.goToQuestion = function(){
        if($scope.question == noquestion){
            console.log("No Question on that Day");
        }else{
            console.log("Data to be Sent: ");
            console.log($scope.question);
        }
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
                var currentDay = new Date($scope.questions[i].date).setHours(0,0,0,0);
                if (dayToCheck === currentDay) {
                    return statusService.checkStatus($scope.questions[i]);
                }
            }
        }
        return '';
    }

    // TODO: Cross check attempts with questionId
    $scope.checkStatus = function(){return 'unattempted';};
}]);

mainApp.controller('questionController', ['$scope', 'statusService', 'dbService', 'questionsData', 'orderByFilter', function($scope, statusService, dbService, questionsData, orderBy){

    $scope.noQuestions = questionsData.length === 0;

    $scope.questions = (!$scope.noQuestions) ? questionsData : [{_id: '500', text: 'No Questions in Course', created_at: 'Instructor has not posted yet.', answers: [], noData: true}];

    $scope.model = {
        questionId: $scope.questions[$scope.questions.length - 1]._id,
        optionsSelected: [],
    };

    $scope.checkStatus = function(question){
        return statusService.checkStatus(question);
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
            switch ($scope.checkStatus(question)){
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
    });

    // Change data whenever a new question is selected from sidebar
    $scope.$watch('model.questionId', function(){
        for (var i = 0; i < $scope.questions.length; i++) {
            var currentQuestion = $scope.questions[i];

            if ($scope.model.questionId == currentQuestion._id) {
                $scope.question = currentQuestion;
                console.dir($scope.question);

                // Reset Fields
                $scope.model.optionsSelected = [];
                $scope.showHint = false;
                $scope.showExplanations = false;
                $scope.addExplanation = false;

                // Direct to Question or Explanation
                $scope.recordExists = $scope.checkStatus($scope.question) != 'unattempted';
                $scope.multipleAnswers = $scope.question.multiChoice;
            }
        }
    });

    $scope.toggleSelection = function(answer){
        var index = $scope.model.optionsSelected.indexOf(answer);
        if(index > -1){
            $scope.model.optionsSelected.splice(index, 1);
        }else{
            $scope.model.optionsSelected.push(answer);
        }
    };

    $scope.submitAnswer = function(){
        console.log("Sending attempt: " + $scope.model);
        dbService.postAttempt($scope.model);
    };

    $scope.enableHint = function(){
        $scope.showHint = true;
        // TODO: Record that user used a hint
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

mainApp.controller('askQuestionController', ['$scope', 'dbService', 'conceptsData', function($scope, dbService, conceptsData){
    $scope.concepts = conceptsData;

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
            $scope.model.answers.splice(index, 1);
        }else{
            $scope.model.answers.push(answer);
        }
    };

    $scope.loadConcepts = function(query){
        var matches = [];
        for(var i = 0; i < $scope.concepts.length; i++){
            var concept = $scope.concepts[i];
            var match = concept.name.indexOf(query);
            if(match != -1){
                matches.push(concept.name);
            }
        }
        return matches;
    };

    var unwrapConcepts = function(conceptsObjectArray){
        var concepts = [];
        for(var i = 0; i < conceptsObjectArray.length; i++){
            concepts.push(conceptsObjectArray[i].text);
        }
        return concepts;
    };

    $scope.submitQuestion = function(){
        $scope.model.concepts = unwrapConcepts($scope.model.concepts);
        console.log($scope.model.concepts);
        console.dir($scope.model);
        //dbService.postQuestion($scope.model);
    };

}]);

mainApp.controller('courseDataController', ['$scope', '$route', 'dbService', 'courseService', 'conceptsData', 'questionsData', 'studentsData', function($scope, $route, dbService, courseService, conceptsData, questionsData, studentsData){
    $scope.course = courseService.currentCourse;
    $scope.questions = questionsData;
    $scope.concepts = conceptsData;
    $scope.students = studentsData;
    $scope.student = { name: 'No Student Chosen' };

    $scope.$watch('student', function(){
        // console.log($scope.student.name);
    });

    $scope.getQuestionCount = function(concept){
        var questionCount = 0;
        for(var j = 0; j < $scope.questions.length; j++){
            var question = $scope.questions[j];
            if(question.concepts.indexOf(concept) > -1){
                questionCount++;
            }
        }
        return questionCount;
    };
    
    $scope.getStudentConceptBar = function(student, concept){
        console.log(concept);
        if($scope.student.name == 'No Student Chosen'){ return 0; }
        var correct = 0;
        var incorrect = 0;
        var courseAttempts = [];
        var questionCount = 0;
        for(var i = 0; i < attempts.length; i++){
            var attempt = student.attempts[i];
            if(attempt.courseId == $scope.course._id){
                courseAttempts.push(attempt);
            }
        }
        for(var j = 0; j < $scope.questions.length; j++){
            var question = $scope.questions[j];
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
        console.log(concept.name + " : " + percentages);

        return percentages;
    };

    $scope.getStudentBar = function(student){
        var allPercentages = [];
        for(var i = 0; i < $scope.concepts.length; i++){
            var currentConcept = $scope.concepts[i];
            var conceptPercentages = $scope.getStudentConceptBar(student, currentConcept);
            allPercentages.push(conceptPercentages);
        }

        var percentages = [];
    };

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

    $scope.model = dbService.getUser();
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
        if($scope.newName === ""){
            $scope.errorMsg = 'Name cannot be empty';
            return false;
        }
        $scope.model.name = $scope.newName;
        dbService.postUserUpdate($scope.model);
        console.log('Name Changed: ' + $scope.newName);
        $scope.resetDialogs();
    };

    $scope.changeEmail = function(){
        $scope.errorMsg = '';
        if($scope.newEmail === ""){
            $scope.errorMsg = 'Email cannot be empty';
            return false;
        }
        $scope.model.email = $scope.newEmail;
        dbService.postUserUpdate($scope.model);
        console.log('Email Changed: ' + $scope.newEmail);
        $scope.resetDialogs();
    };

    $scope.changePassword = function(){
        $scope.errorMsg = '';
        if($scope.newPassword === ""){
            $scope.errorMsg = 'Password cannot be empty';
            return 0;
        }
        var newPasswordHash = CryptoJS.MD5($scope.newPassword).toString();
        var confirmPasswordHash = CryptoJS.MD5($scope.confirmPassword).toString();

        if(newPasswordHash != confirmPasswordHash){
            $scope.errorMsg = 'Passwords do not match';
            return 0;
        }
        $scope.model.password = newPasswordHash;
        dbService.postUserUpdate($scope.model);
        console.log('Password Changed: ********');
        $scope.resetDialogs();
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

    $scope.leaveCourse = function(course){
        $scope.errorMsg = '';
        var index = $scope.model.courses.indexOf(course);
        if(index == -1){
            console.log("Not enrolled in Course");
            return false;
        }
        $scope.model.courses.splice(index, 1);
        dbService.postUserUpdate($scope.model);
        console.log('Left Course: ' + course.name);
        $scope.resetDialogs();
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
