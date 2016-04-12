var app = angular.module('SC', ['ngRoute', 'ngAnimate']);

app.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[');
  $interpolateProvider.endSymbol(']}');
}]);


app.config(function($routeProvider){
  $routeProvider
    .when('/home',{
        templateUrl:'/home',
        controller: 'homeController',
        animation: 'main'
    })
    .when('/',{
        templateUrl:'/home',
        controller: 'homeController',
        animation: 'main'
    })
    .when('/earthquakes',{
        templateUrl:'/earthquakes',
        controller: 'eqController',
        animation: 'main'
    })

});
      