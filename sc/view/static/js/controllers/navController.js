app.controller('navController', ['$scope', function($scope) {
    $scope.nav_links = [{
        title: 'home',
        text: 'Home',
    }, {
        title: 'about',
        text: 'About Us'
    }, {
        title: 'contact',
        text: 'Contact Us'
    }, {
        title: 'earthquakes',
        text: 'Earthquakes'
    }];

}]);