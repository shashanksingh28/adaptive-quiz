'use strict';

angular.module('adaptiveQuizApp.auth', [
  'adaptiveQuizApp.constants',
  'adaptiveQuizApp.util',
  'ngCookies',
  'ngRoute'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
