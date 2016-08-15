var mainApp = angular.module('mainApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ngTagsInput', 'ngCookies']);
var baseURL = "localhost:3000/";

mainApp.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/redirect', {
            template: 'redirecting...',
        })
    .when('/dashboard', {
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
        controller: 'accountController',
        resolve: {
            coursesData: function(dbService){
                return dbService.getAllCourses()
                    .then(function(response){
                        return response;});
            },
        },
    })
    .otherwise({
        redirectTo: '/redirect'
    });

}]);

mainApp.run(['$rootScope', '$location', 'authService', function($rootScope, $location, authService){
    $rootScope.$on('$routeChangeStart', function(events, next, previous){
        if($location.$$path == "/redirect" || $location.$$path == "/dashboard" || $location.$$path == "/coursedata"){
            event.preventDefault();
            if(authService.isTeacher()){
                $location.path('/coursedata');
            }else{
                $location.path('/dashboard');
            }
        }
    });
}]);

mainApp.service('authService', ['dbService', 'courseService', function(dbService, courseService){

    this.isTeacher = function(){
        if(courseService.enrolled && courseService.currentCourse.instructorIds.indexOf(dbService.getUser()._id) != -1){
            return true;
        }
        return false;
    };

}]);

mainApp.service('dbService', ['$http', '$window', function($http, $window){

    this.getUser = function(){
        return user_client;
    };

    this.initQuestion = function(){
        return question_client;
    };

    this.baseURL = 'localhost:3000';

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

    this.getAllCourses = function(){
        return $http.get('/api/getAllCourses').then(function(httpResponse){
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

    this.getExplanations = function(questionId, callback){
        $http.get('/api/getExplanations', {params: questionId}).then(function(httpResponse){
            var response = httpResponse.data;
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                callback(response.data);
            }
        }, function(error){
            console.log("Problem in Connecting to Server:");
            console.log(error);
        });
    };

    this.getQuestionNotes = function(questionId, callback){
        $http.get('/api/getQuestionNotes', {params: questionId}).then(function(httpResponse){
            var response = httpResponse.data;
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                callback(response.data);
            }
        }, function(error){
            console.log("Problem in Connecting to Server:");
            console.log(error);
        });
    };

    this.postAttempt = function(model, callback){
        $http.post('/api/postAttempt', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Attempt Posted");
                callback();
            }
        }, function(error){
            console.log("Problem in Connecting to Server:");
            console.log(error);
        });
    };

    this.postQuestion = function(model){
        $http.post('/api/postQuestion', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Question Created");
                $window.location.reload();
            }
        }, function(error){
            console.log("Problem in Connecting to Server:");
            console.log(error);
        });
    };

    this.postConcept = function(model){
        $http.post('/api/addConcept', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Concept Added");
                $window.location.reload();
            }
        }, function(error){
            console.log("Problem in connecting to server");
        });
    };

    this.postExplanation = function(model, callback){
        $http.post('/api/postExplanation', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Explanation Added:");
                console.log(response);
                callback();
            }
        }, function(error){
            console.log("Problem in connecting to server");
        });
    };

    this.postNote = function(model, callback){
        $http.post('/api/postNote', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Note Added:");
                console.log(response);
                callback();
            }
        }, function(error){
            console.log("Problem in connecting to server");
        });
    };

    this.postUpvote = function(explanationId, callback){
        $http.post('/api/postUpvote', {_id: explanationId}).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Vote Added");
                callback();
            }
        }, function(error){
            console.log("Problem in connecting to server");
        });
    };

    this.postUnVote = function(explanationId, callback){
        $http.post('/api/postUnVote', {_id: explanationId}).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Vote Removed");
                callback();
            }
        }, function(error){
            console.log("Problem in connecting to server");
        });
    };

    this.postUserUpdate = function(model){
        console.log(model);
        $http.post('/api/postUserUpdate', model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                $window.location.reload();
            }
        }, function(error){
            console.log("Problem in connecting to server");
        });
    };

    this.postLog = function(eventType, objectType, objectValue){
        var model = {
            userId: this.getUser()._id,
            event_type: eventType,
            object_type: objectType,
            object_value: objectValue
        };
        $http.post('/api/log', model).then(function(httpResponse){
            var response = httpResponse.data;
            if(response.status != "OK"){
                console.log(response.eMessage);
            }
            else{
                console.log("Action Logged");
            }
        }, function(error){
            console.log("Problem in connecting to server");
        });
    };

}]);

mainApp.service('courseService', ['$window', 'dbService', function($window, dbService){

    this.courses = function(){
        var courseIds = dbService.getUser().courses;
        var allCourses = allCourses_client;
        var courseObjects = [];
        for(var i = 0; i < courseIds.length; i++){
            for(var j = 0; j < allCourses.length; j++){
                if(courseIds[i] == allCourses[j]._id){
                    courseObjects.push(allCourses[j]);
                    break;
                }
            }
        }
        return courseObjects;
    };

    this.enrolled = this.courses().length > 0;

    this.currentCourse = this.courses()[0];

    this.changeCourse = function(course){
        for(var i = 0; i < this.courses().length; i++){
            if(this.courses()[i]._id == course._id){
                this.currentCourse = this.courses()[i];
            }
        }
        console.log("Course not found");
    };

}]);

mainApp.service('questionService', ['$window', function($window){

    this.savedQuestionId = null;

    this.save = function(questionId){
        this.savedQuestionId = questionId;
        $window.location.href = '/#/question';
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

mainApp.controller('navController', ['$scope', '$http', '$window', 'dbService', 'courseService', 'authService', function ($scope, $http, $window, dbService, courseService, authService) {
    $scope.isTeacher = authService.isTeacher();

    $scope.user = dbService.getUser();

    $scope.course = (courseService.enrolled) ? courseService.currentCourse : {name: "None"};

    $scope.courses = (courseService.enrolled) ? courseService.courses() : [{name: "No Courses"}];

    $scope.questionRoute = function(){
        if(courseService.enrolled){
            return '/#/question';
        }else{
            return '/#/questionsunavailable';
        }
    };

    $scope.logout = function(){
        console.log("Logging out");
        $http.get('/api/logout')
            .then(function(successResponse){
                $scope.message = "Logging out";
                $window.location.href = '/';
            }, function(error){
                console.log("Failed to log out");
            }
            );
    };

    $scope.changeCourse = function(courseName){
        courseService.changeCourse(courseName);
    };

}]);

mainApp.controller('dashboardController', ['$scope', 'dbService', 'statusService', 'questionService', 'courseService', 'conceptsData', 'questionsData', function($scope, dbService, statusService, questionService, courseService, conceptsData, questionsData){

    $scope.courseExists = questionsData.length > 0;
    $scope.concepts = conceptsData;
    $scope.questions = questionsData;
    $scope.student = dbService.getUser();
    $scope.attempts = $scope.student.attempts;
    $scope.course = courseService.currentCourse;

    $scope.getQuestionCount = function(concept){
        concept = concept.replace(/\s+/g, '-');
        var questionCount = 0;
        for(var j = 0; j < $scope.questions.length; j++){
            var question = $scope.questions[j];
            if(question.concepts.indexOf(concept) > -1){
                questionCount++;
            }
        }
        return questionCount;
    };

    // -------- Concepts Panel --------
    $scope.getStudentConceptBar = function(student, concept){
        if($scope.student.name == 'No Student Chosen'){ return [0, 0, 1]; }
        concept = concept.replace(/\s+/g, '-');
        var correct = 0;
        var incorrect = 0;
        var courseAttempts = [];
        var questionCount = 0;
        for(var i = 0; i < student.attempts.length; i++){
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
            incorrect / questionCount,
        ];
        percentages.push(1 - (percentages[0] + percentages[1]));

        return percentages;
    };

    $scope.formatPercentages = function(percentages, index){
        var formattedPercentages = [];
        for(var i = 0; i < percentages.length; i++){
            formattedPercentages.push((percentages[i] * 100) + "%");
        }
        return formattedPercentages;
    };

    $scope.formatRoundPercentages = function(percentages, index){
        var formattedPercentages = [];
        for(var i = 0; i < percentages.length; i++){
            formattedPercentages.push(Math.round(percentages[i] * 100) + "%");
        }
        return formattedPercentages;
    };

    // -------- Question Panel --------
    $scope.noquestion = {
        concepts: ["No Question"],
    };

    $scope.question = $scope.noquestion;

    $scope.formatConcepts = function(){
        var concepts = "";
        for(var i = 0; i < $scope.question.concepts.length; i++){
            var currentConcept = $scope.question.concepts[i].replace(/-/g, ' ');
            if(concepts === ""){
                concepts = currentConcept;
            }else{
                concepts = concepts.concat(", ", currentConcept);
            }
        }
        return concepts;
    };

    $scope.$watch('dt', function(){
        var dayToCheck = new Date($scope.dt).setHours(0,0,0,0);
        for(var i = 0; i < $scope.questions.length; i++){
            var currentDay = new Date($scope.questions[i].created_at).setHours(0,0,0,0);
            if (dayToCheck === currentDay) {
                $scope.question = $scope.questions[i];
                dbService.postLog("click", "calendarQuesiton", currentDay);
                return true;
            }
        }
        $scope.question = $scope.noquestion;
    });

    $scope.goToQuestion = function(){
        if($scope.question == $scope.noquestion){
            console.log("No Question on that Day");
        }else{
            dbService.postLog("click", "calendarToQuestion", $scope.question._id);
            questionService.save($scope.question._id);
        }
    };

    // Go to Question if Loaded from Email Link
    if(dbService.initQuestion() !== ""){
        dbService.postLog("click", "emailToQuestion", dbService.initQuestion());
        questionService.save(dbService.initQuestion());
    }

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
            for (var i = 0; i < $scope.questions.length; i++) {
                var currentDay = new Date($scope.questions[i].created_at).setHours(0,0,0,0);
                if (dayToCheck === currentDay) {
                    return statusService.checkStatus($scope.questions[i]);
                }
            }
        }
        return '';
    }
}]);

mainApp.controller('questionController', ['$scope', '$route', '$window', 'statusService', 'dbService', 'questionService', 'authService', 'questionsData', 'orderByFilter', '$cookies', function($scope, $route, $window, statusService, dbService, questionService, authService, questionsData, orderBy, $cookies){
    $scope.user = dbService.getUser();

    $scope.noQuestions = questionsData.length === 0;

    $scope.questions = (!$scope.noQuestions) ? questionsData : [{_id: '500', text: 'No Questions in Course', created_at: 'Instructor has not posted yet.', answers: [], noData: true}];

    $scope.getOptionsSelected = function(){
        if(authService.isTeacher()){ 
            return []; }
        var allAttempts = dbService.getUser().attempts;
        for(var i = 0; i < allAttempts.length; i++){
            var currentAttempt = allAttempts[i];
            if(currentAttempt.questionId == $scope.question._id){
                return currentAttempt.optionsSelected;
            }
        }
    };

    $scope.model = {
        questionId: $scope.questions[$scope.questions.length - 1]._id,
        optionsSelected: [],
    };

    $scope.checkStatus = function(question){
        return statusService.checkStatus(question);
    };

    $scope.logSidebarClick = function(){
        if(!authService.isTeacher){
            dbService.postLog("click", "questionSidebar", $scope.model.questionId);
        }
    };

    // Retreive Question from Dashboard Calendar
    if(questionService.savedQuestionId){
        console.log('i came from calendar');
        $scope.model.questionId = questionService.savedQuestionId;
        questionService.savedQuestionId = null;
    }
    
    // Retreive Question from Cookies
    if($cookies.get("savedQuestionId") != null){
        $scope.model.questionId = $cookies.get("savedQuestionId");
        $cookies.remove("savedQuestionId");
    }

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

    $scope.$watchGroup(['orderVal', 'reverse'], function(){
        $scope.questions = orderBy($scope.questions, $scope.orderVal, $scope.reverse);
    });

    // Change data whenever a new question is selected from sidebar
    $scope.$watch('model.questionId', function(){
        for (var i = 0; i < $scope.questions.length; i++) {
            var currentQuestion = $scope.questions[i];

            if ($scope.model.questionId == currentQuestion._id) {
                $scope.question = currentQuestion;

                // Reset Fields
                $scope.model.optionsSelected = [];
                $scope.showHint = false;
                $scope.noHint = true;
                $scope.showExplanations = false;
                $scope.addExplanation = false;
                $scope.expModel.text = "";

                // Set Values to Format View
                $scope.recordExists = authService.isTeacher() || $scope.checkStatus($scope.question) != 'unattempted';
                $scope.noHint = $scope.question.hint === "";
                $scope.multipleAnswers = $scope.question.multiOption;
                $scope.explanations = dbService.getExplanations($scope.model, function(explanations){
                    $scope.explanations = orderBy(explanations, $scope.expOrderVal, true);      
                });
                if(!authService.isTeacher()){
                    if($scope.recordExist){
                        dbService.postLog("view", "attemptedQuestion", $scope.question._id);
                    }else{
                        dbService.postLog("view", "unattemptedQuestion", $scope.question._id);
                    }
                }
                break;
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
        console.log($scope.model.optionsSelected);
    };

    $scope.submitAnswer = function(){
        var stringToNum = [];
        for(var i = 0; i < $scope.model.optionsSelected.length; i++){
            stringToNum.push(Number($scope.model.optionsSelected[i]));
        }
        $scope.model.optionsSelected = stringToNum;
        dbService.postAttempt($scope.model, function(){
            $cookies.put("savedQuestionId", $scope.model.questionId);
            $window.location.reload();
        });
    };

    $scope.enableHint = function(){
        $scope.showHint = true;
        dbService.postLog("click", "enableHint", $scope.model.questionId);
        // TODO: Record that user used a hint
    };

    // Explanations
    $scope.expModel = {
        userId: $scope.user._id,
        userName: $scope.user.name,
        questionId: $scope.model.questionId,
        text: "",
        votes: [],
    };

    $scope.postExplanation = function(){
        $scope.expModel.questionId = $scope.model.questionId;
        dbService.postExplanation($scope.expModel, function(){
            $scope.expModel.text = "";
            $scope.explanations = dbService.getExplanations($scope.model, function(explanations){
                $scope.explanations = orderBy(explanations, $scope.expOrderVal, true);      
            });
        });
    };

    $scope.expOrder = 'votes';
    $scope.expOrderVal = 'votes.length';

    $scope.$watch('expOrderVal', function(){
        $scope.explanations = orderBy($scope.explanations, $scope.expOrderVal, true);      
    });

    $scope.expSortDate = function() {
        $scope.expOrder = 'recent';
        $scope.expOrderVal = 'created_at';
    };

    $scope.expSortVotes = function() {
        $scope.expOrder = 'votes';
        $scope.expOrderVal = 'votes';
    };

    $scope.upvote = function(explanation){
        dbService.postUpvote(explanation._id, function(){
            $scope.explanations = dbService.getExplanations($scope.model, function(explanations){
            });
        });
    };

    $scope.unvote = function(explanation){
        dbService.postUnVote(explanation._id, function(){
            $scope.explanations = dbService.getExplanations($scope.model, function(explanations){
            });
        });
    };
    
    //Notes
    $scope.notes = dbService.getQuestionNotes($scope.model, function(notes){
        $scope.notes = notes;
        $scope.loadNotes();
    });

    $scope.loadNotes = function(){
        $scope.hasOwnNote = false;
        $scope.ownNote = {};
        $scope.filteredNotes = [];
        for(var i = 0; i < $scope.notes.length; i++){
            if($scope.notes[i].userId == $scope.user._id){
                $scope.hasOwnNote = true;
                $scope.ownNote = $scope.notes[i];
                $scope.filteredNotes = $scope.notes;
                $scope.filteredNotes.splice(i,1);
                break;
            }
        }
    };

    $scope.noteModel = {
        userId: $scope.user._id,
        questionId: $scope.model.questionId,
        text: "",
    };

    $scope.postNote = function(){
        $scope.noteModel.questionId = $scope.model.questionId;
        dbService.postNote($scope.noteModel, function(){
            $scope.noteModel.text = "";
            $scope.notes = dbService.getQuestionNotes($scope.model, function(notes){
                $scope.notes = notes;
                $scope.loadNotes();
            });
        });
    };

}]);

mainApp.controller('askQuestionController', ['$scope', '$route', 'dbService', 'courseService', 'conceptsData', function($scope, $route, dbService, courseService, conceptsData){
    $scope.concepts = conceptsData;

    $scope.model = {
        courseId: courseService.currentCourse._id,
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
        if($scope.model.answers.length === 0){
            $scope.errorMsg = "Please choose correct answers";
            return false;
        }
        if($scope.model.concepts.length === 0){
            $scope.errorMsg = "Please choose concepts related to question";
            return false;
        }
        $scope.model.concepts = unwrapConcepts($scope.model.concepts);
        console.log($scope.model.concepts);
        console.dir($scope.model);
        dbService.postQuestion($scope.model);
        $route.reload();
    };

}]);

mainApp.controller('courseDataController', ['$scope', '$route', 'dbService', 'courseService', 'conceptsData', 'questionsData', 'studentsData', function($scope, $route, dbService, courseService, conceptsData, questionsData, studentsData){
    $scope.course = courseService.currentCourse;
    $scope.questions = questionsData;
    $scope.concepts = conceptsData;
    $scope.students = studentsData;
    $scope.student = ($scope.students[0]) ? $scope.students[0] : { name: 'No Student Chosen' };

    $scope.$watch('student', function(){
        console.log($scope.student.name);
        dbService.postLog('click', 'studentReport', $scope.student._id);
    });

    $scope.getQuestionCount = function(concept){
        concept = concept.replace(/\s+/g, '-');
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
        if($scope.student.name == 'No Student Chosen'){ return [0, 0, 1]; }
        concept = concept.replace(/\s+/g, '-');
        var correct = 0;
        var incorrect = 0;
        var courseAttempts = [];
        var questionCount = 0;
        for(var i = 0; i < student.attempts.length; i++){
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
        if(questionCount === 0){ return [0, 0, 1]; }

        var percentages = [
            correct / questionCount,
            incorrect / questionCount,
        ];
        percentages.push(1 - (percentages[0] + percentages[1]));

        return percentages;
    };

    $scope.getStudentBar = function(student){
        var allPercentages = [];
        for(var i = 0; i < $scope.concepts.length; i++){
            var currentConcept = $scope.concepts[i].name;
            var conceptPercentages = $scope.getStudentConceptBar(student, currentConcept);
            allPercentages.push(conceptPercentages);
        }
        if(allPercentages == []){ return [0, 0, 1]; }

        var percentages = [0, 0, 0];
        for(var j = 0; j < allPercentages[0].length; j++){
            for(var k = 0; k < allPercentages.length; k++){
                percentages[j] += allPercentages[k][j];
            }
            percentages[j] /= $scope.concepts.length;
        }
        return percentages;
    };

    $scope.getConceptBar = function(concept){
        var allPercentages = [];
        for(var i = 0; i < $scope.students.length; i++){
            var currentStudent = $scope.students[i];
            var studentPercentages = $scope.getStudentConceptBar(currentStudent, concept);
            allPercentages.push(studentPercentages);
        }
        if(allPercentages == []){ return [0, 0, 1]; }

        var percentages = [0, 0, 0];
        for(var j = 0; j < allPercentages[0].length; j++){
            for(var k = 0; k < allPercentages.length; k++){
                percentages[j] += allPercentages[k][j];
            }
            percentages[j] /= $scope.students.length;
        }
        return percentages;
    };

    $scope.formatPercentages = function(percentages, index){
        var formattedPercentages = [];
        for(var i = 0; i < percentages.length; i++){
            formattedPercentages.push((percentages[i] * 100) + "%");
        }
        return formattedPercentages;
    };

    $scope.formatRoundPercentages = function(percentages, index){
        var formattedPercentages = [];
        for(var i = 0; i < percentages.length; i++){
            formattedPercentages.push(Math.round(percentages[i] * 100) + "%");
        }
        return formattedPercentages;
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


mainApp.controller('accountController', ['$scope', 'dbService', 'courseService', 'coursesData', function($scope, dbService, courseService, coursesData){
    $scope.allCourses = coursesData;

    $scope.model = dbService.getUser();

    $scope.courses = courseService.courses();

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

    $scope.joinCourse = function(course){
        $scope.errorMsg = '';
        if($scope.model.courses.indexOf(course._id) != -1){
            $scope.errorMsg = 'Already Enrolled';
            return 0;
        }else{
            $scope.model.courses.push(course._id);
            courseService.courses().push(course);
            $scope.openAddCourse = false;
            dbService.postUserUpdate($scope.model);
            console.log($scope.model);
            $scope.resetDialogs();
        }
    };

    $scope.chooseCourseToLeave = function(courseName){
        $scope.resetDialogs();
        $scope.courseToLeave = courseName;
        $scope.openDeleteCourse = true;
        return 1;
    };

    $scope.leaveCourse = function(course){
        $scope.errorMsg = '';
        console.log(course);
        var index = $scope.model.courses.indexOf(course._id);
        if(index == -1){
            console.log("Not enrolled in Course");
            return false;
        }
        $scope.model.courses.splice(index, 1);
        courseService.courses().splice(index, 1);
        dbService.postUserUpdate($scope.model);
        console.log($scope.model);
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
