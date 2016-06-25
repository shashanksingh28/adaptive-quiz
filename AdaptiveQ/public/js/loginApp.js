var loginApp = angular.module('loginApp', ['ngAnimate']);

loginApp.run(function($rootScope){
        $rootScope.form = 1;
});

loginApp.controller('loginController', function($scope, $rootScope){
        $scope.toRegister = function(){
                $rootScope.form = 2;
        };
        $scope.toRecovery = function(){
                $rootScope.form = 3;
        };

        $scope.error_msg = "";
        $scope.user = {email: $scope.loginEmail,
                       password: $scope.loginPassword};

        $scope.login = function(){
                $scope.error_msg = "login button pressed";
        }; 
});
        
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
