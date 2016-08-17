var resetApp = angular.module('resetApp', []);

resetApp.controller('resetController', ['$http', '$window', '$scope', function($http, $window, $scope){
    $scope.recovery_msg = "";
    $scope.error_msg = "";
    $scope.model = {'email': email, 'password': '', 'token': token};

    $scope.resetPassword = function(){
        $scope.error_msg = "";

        if($scope.model.password != $scope.passwordConfirm){
            $scope.error_msg = "Passwords do not match.";
            return false;
        }

        $scope.model.password =  CryptoJS.MD5($scope.model.password).toString();
        $scope.passwordConfirm = $scope.model.password;

        console.log($scope.model);
        $http.post('/api/resetPassword', $scope.model).then(function(httpResponse){
            var response = httpResponse.data;
            console.log(response);
            if(response.status != "OK"){
                $scope.error_msg = response.eMessage;
                //Password mismatch and connection error already handled
                //If no other error possible, then this can be deleted
            }
            else{
                $scope.recovery_msg = "Reset Successful! Logging in...";
                //login and go to dashboard
                $window.location.href = '/';
            }

        }, function(error){
            $scope.error_msg = "Problem in connecting to server";
        });

    };
}]);
