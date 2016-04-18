var app = angular.module('login', ['ngRoute', 'ngAnimate']);

app.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[');
  $interpolateProvider.endSymbol(']}');
}]);

app.config(function($routeProvider){
  $routeProvider
    .when('/login',{
        templateUrl:'/login',
        controller: 'loginController'
    })
    .when('/register',{
        templateUrl:'/register',
        controller: 'loginController'
    })
});