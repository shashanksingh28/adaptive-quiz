var mainApp = angular.module('mainApp', ['ngRoute']);

mainApp.config(['$routeProvider', function($routeProvider){
    /*
       $routeProvider
       .when('/dashboard', {
       templateUrl: 'dashboard.html'
       })
       .when('/question', {
       templateUrl: 'question.html'
       })
       .when('/askquestion', {
       templateUrl: 'askquestion.html'
       })
       .when('/classdata', {
       templateUrl: 'classdata.html'
       })
       .when('/myaccount', {
       templateUrl: 'myaccount.html'
       })
       .otherwise({
       redirectTo: '/dashboard'
       });
       */
}]);

mainApp.controller('mainController', ['$http', '$scope', function ($http, $scope) {
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

//The routeProvider functionality apparently won't work unless it's run on a server...
