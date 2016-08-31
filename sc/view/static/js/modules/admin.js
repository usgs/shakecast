var app = angular.module('SC-admin', ['ngRoute', 'ngAnimate', 'leaflet-directive']);

app.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[');
  $interpolateProvider.endSymbol(']}');
}]);


app.config(function($routeProvider){
  $routeProvider
    .when('/settings/',{
        templateUrl:'/admin/settings/',
        controller: 'settingsController',
        animation: 'main'
    })
    .when('/inventory/',{
        templateUrl:'/admin/inventory/',
        controller: 'inventoryController',
        animation: 'main'
    })
    .when('/users/',{
        templateUrl:'/admin/users/',
        controller: 'userController',
        animation: 'main'
    })
    .when('/groups/',{
        templateUrl:'/admin/groups/',
        controller: 'groupController',
        animation: 'main'
    })
    .when('/upload/',{
        templateUrl:'/admin/upload/',
        controller: 'uploadController',
        animation: 'main'
    })
    .when('/earthquakes/',{
        templateUrl:'/admin/earthquakes',
        controller: 'eqController',
        animation: 'main'
    })
    .when('/notification/',{
        templateUrl:'/admin/notification',
        controller: 'notController',
        animation: 'main'
    })
});

app.filter("unsafe", function($sce) { return $sce.trustAsHtml; });
      