var loginApp = angular.module('loginApp', ['ngAnimate']);

loginApp.run(function($rootScope){
        $rootScope.form = 1;
});

loginApp.controller('loginController',['$http','$scope','$rootScope', function($http, $scope, $rootScope){
        $scope.toRegister = function(){
                $rootScope.form = 2;
        };
        $scope.toRecovery = function(){
                $rootScope.form = 3;
        };

        $scope.model = {'email': '', 'password' : '' };
        //$scope.loginEmail = "";
        //$scope.error_msg = "";
        //$scope.user = {email: $scope.loginEmail,
        //               password: $scope.loginPassword};

        $scope.login = function(){

          console.log($scope.model);
          $http.post('/login', $scope.model).then(function(successResponse){
            $scope.error_msg = "Authenticated";
            console.log(successResponse);
          }, function(error){
            $scope.error_msg = "Problem in connecting to server";
          });
        };
}]);

loginApp.controller('registerController', function($scope, $rootScope){
        $scope.toLogin = function(){
                $rootScope.form = 1;
        };

        $scope.error_msg = "";
        $scope.newuser = {accountType: $scope.accounttype,
                          name: $scope.registerName,
                          mail: $scope.registerEmail,
                          password: $scope.registerPassword};

        $scope.register = function(){
                $scope.error_msg = "register button pressed";
        };
});

loginApp.controller('recoveryController', function($scope, $rootScope){
        $scope.toLogin = function(){
                $rootScope.form = 1;
        };

        $scope.error_msg = "";
        $scope.recovery_msg = "";

        $scope.recovery = function(){
                $scope.recovery_msg = "recovery button pressed";
        };
});
