app.controller('notController', function($scope, $http) {
    $scope.templates =[{name: 'New Event', url: '/new_event'},
                       {name: 'Inspection', url: '/inspection'}];
    
    $scope.template = $scope.templates[0];
});