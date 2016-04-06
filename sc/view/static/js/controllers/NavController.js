app.controller('NavController', ['$scope', '$http', '$location', function($scope, $http, $location) {
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
        title: '../html/eqpage.html',
        text: 'Earthquakes'
    }];

    $scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    };
    
}]);