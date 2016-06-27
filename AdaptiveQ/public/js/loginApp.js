var loginApp = angular.module('loginApp', ['ngAnimate']);

loginApp.run(function($rootScope){
    $rootScope.form = 1;
});

loginApp.controller('loginController',['$http','$window','$scope','$rootScope', function($http, $window, $scope, $rootScope){

    $scope.toRegister = function(){
        $rootScope.form = 2;
    };
    $scope.toRecovery = function(){
        $rootScope.form = 3;
    };

    $scope.model = {'email': '', 'password' : '' };

    $scope.login = function(){
        $scope.error_msg = "";
        //Hash
        $scope.model.password =  CryptoJS.MD5($scope.model.password).toString();

        console.log($scope.model);
        $http.post('/login', $scope.model).then(function(httpResponse){
            //$scope.error_msg = "Authenticated";
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
}]);

loginApp.controller('registerController', function($scope, $rootScope){
    $scope.toLogin = function(){
        $rootScope.form = 1;
    };

    $scope.error_msg = '';
    $scope.model = {accountType: '',
        name: '',
        email: '',
        password: '',
        teacherCode: ''};

    $scope.register = function(){
        newhash();

        $scope.error_msg = "register button pressed";
    };


    function newhash(){
        if($scope.model.password != $scope.confirmPassword) return false;
        $scope.model.password =  CryptoJS.MD5($scope.model.password).toString();
        $scope.confirmPassword = $scope.model.password;
        console.log(pass.value);

        return true;
    }
});

loginApp.controller('recoveryController', ['$http','$scope','$rootScope',function($http, $scope, $rootScope){
    $scope.toLogin = function(){
        $rootScope.form = 1;
    };

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
}]);
