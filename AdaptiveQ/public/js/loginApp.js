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
          var pass = document.getElementById("password");
          pass.value =  CryptoJS.MD5(pass.value).toString();

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
          var pass = document.getElementById("new_password");
          var passConfirm = document.getElementById("new_password_confirm");

          if(pass.value != passConfirm.value) return false;
          pass.value =  CryptoJS.MD5(pass.value).toString();
          passConfirm.value = pass.value;
          console.log(pass.value);

          return true;
        }
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
