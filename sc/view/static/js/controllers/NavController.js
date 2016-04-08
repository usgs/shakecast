app.controller('navController', ['$scope', function($scope) {
    $scope.nav_links = [{
        title: '',
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
/*
    $scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    };
  */  
}]);