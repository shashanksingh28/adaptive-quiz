var recoveryApp = angular.module('recoveryApp');

recoveryApp.controller('recoveryController', ['$http', '$window', '$scope', '$rootScope', function($http, $window, $scope, $rootScope){

    $scope.model = {'email': '', 'password': '' };

    $scope.resetPassword = function(){
        $scope.error_msg = "";

        if($scope.model.password != $scope.passwordConfirm){
            $scope.error_msg = "Passwords do not match.";
            return false;
        }

        $scope.model.password =  CryptoJS.MD5($scope.model.password).toString();
        $scope.passwordConfirm = $scope.model.password;

        console.log($scope.model);
        $http.post('/resetPassword', $scope.model).then(function(httpResponse){
           var response = httpRespone.data;
           console.log(response);
           if(response.status != "OK"){
               $scope.error_msg = respone.eMessage;
               //Password mismatch and connection error already handled
               //If no other error possible, then this can be deleted
           }
           else{
               //login and go to dashboard
               $window.location.href = '/';
           }

        }, function(error){
            $scope.error_msg = "Problem in connecting to server";
        });

    };
}]);
