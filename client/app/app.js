'use strict';

angular.module('adaptiveQuizApp', [
  'adaptiveQuizApp.auth',
  'adaptiveQuizApp.admin',
  'adaptiveQuizApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'validation.match'
])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
