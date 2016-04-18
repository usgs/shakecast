app.controller('navController', ['$scope', function($scope) {
    $scope.nav_links = [{
        title: 'inventory',
        text: 'Inventory',
    }, {
        title: 'users',
        text: 'Users'
    }, {
        title: 'groups',
        text: 'Groups'
    }, {
        title: 'earthquakes',
        text: 'Earthquakes'
    }, {
        title: 'upload',
        text: 'Upload'
    }, {
        title: 'settings',
        text: 'Settings'
    }];
}]);