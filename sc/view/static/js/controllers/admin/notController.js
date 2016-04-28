app.controller('notController', function($scope, $http) {
    $scope.somenum = $http.get('/admin/notification',
                               {params: {name: 'name',
                                         another: 'second'}})
});