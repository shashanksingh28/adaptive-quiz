var loginApp = angular.module('loginApp', ['ngAnimate']);

loginApp.run(function($rootScope){
    $rootScope.form = 1;
});

loginApp.controller('loginController',['$http','$window','$scope','$rootScope', function($http, $window, $scope, $rootScope){
    $scope.error_msg = '';
    $scope.model = {'email': '', 'password' : '' };

    $scope.login = function(){
        $scope.error_msg = "";

        $scope.model.password =  CryptoJS.MD5($scope.model.password).toString();
        console.log($scope.model);

        $http.post('/login', $scope.model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK") {
                $scope.error_msg = response.eMessage;
            }
            else{
                if(response.url){
                    // server suggests a url to go to
                    $window.location.href = url;
                }
                else{
                    // default behavior
                    $window.location.href = '/';
                }
            }

        }, function(error){
            $scope.error_msg = "Problem in connecting to server";
        });

    };

    $scope.toRegister = function(){
        $scope.model.email = '';
        $scope.model.password = '';
        $rootScope.form = 2;
    };
    $scope.toRecovery = function(){
        $scope.model.email = '';
        $scope.model.password = '';
        $rootScope.form = 3;
    };
}]);

loginApp.controller('registerController', ['$http','$window', '$scope', '$rootScope', function($http, $window, $scope, $rootScope){
    $scope.error_msg = '';
    $scope.model = 
        {accountType: '',
        name: '',
        email: '',
        password: '',
        teacherCode: ''};
    $scope.passwordConfirm = '';

    $scope.register = function(){
        $scope.error_msg = "";

        if($scope.model.password != $scope.confirmPassword){
            $scope.error_msg = "Passwords do not match.";
            return false;
        }

        $scope.model.password =  CryptoJS.MD5($scope.model.password).toString();
        $scope.passwordConfirm = $scope.model.password;

        console.log($scope.model);
        $http.post('/register', $scope.model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                $scope.error_msg = response.eMessage;
            }
            else{
                // login new account and go to dashboard
                $window.location.href = '/';
            }
         
        }, function(error){
            $scope.error_msg = "Problem in connecting to server";
        });

    };

    $scope.toLogin = function(){
        $scope.model.accountType = 'Student';
        $scope.error_msg = '';
        $rootScope.form = 1;
    };
}]);

loginApp.controller('recoveryController', ['$http','$scope','$rootScope',function($http, $scope, $rootScope){
    $scope.error_msg = "";
    $scope.recovery_msg = "";
    $scope.model = { recoveryEmail : ''};

    $scope.recovery = function(){
        $http.post('/recover',$scope.model).then(function(httpResponse){
            var response = httpResponse.data;
            if(response.status != "OK") {
                $scope.recovery_msg = "";
                $scope.error_msg = response.eMessage;
            }
            else{
                $scope.recovery_msg = "An email will be sent to your current email ID";
                $scope.error_msg = "";
            }
        }, function(error){
            $scope.recovery_msg = "";
            $scope.error_msg = "Problem connecting to the server";
        });
    };

    $scope.toLogin = function(){
        $scope.model.recoveryEmail = '';
        $scope.recovery_msg = '';
        $scope.error_msg = '';
        $rootScope.form = 1;
    };
}]);
