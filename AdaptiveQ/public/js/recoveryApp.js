var recoveryApp = angular.module('recoveryApp');

recoveryApp.controller('recoveryController', ['$http', '$window', '$scope', '$rootScope', function($http, $window, $scope, $rootScope){

        $scope.model = {'email': '', 'password': '' };

        $scope.resetPassword = function(){
          $scope.error_msg = "";
          var pass = document.getElementById("new_password");
          var passConfirm = document.getElementById("new_password_confirm");
          if(pass.value != passConfirm.value){
                  $scope.error_msg = "Passwords do not match.";
                  return false;
          }
                  //Hash
          pass.value =  CryptoJS.MD5(pass.value).toString();
          passConfirm.value = pass.value;

          console.log($scope.model);
          $http.post('/resetPassword', $scope.model).then(function(httpResponse){
                  //Handle Response
                
          }, function(error){
                  $scope.error_msg = "Problem in connecting to server";
          });

        };

        $scope.redirectToLogin = function(){};
}]);
