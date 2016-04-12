app.controller('mainController', function($scope, $rootScope) {
        // create a message to display in our view
        /*
        $scope.loading = false;
        $scope.$on('$routeChangeStart', function() {
                $scope.loading = true;
        });
        $scope.$on('$routeChangeSuccess', function() {
                $scope.loading = false;
        });
        $scope.$on('$routeChangeError', function() {
                $scope.loading = false;
        });
        */
        $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){
                $rootScope.animation = currRoute.animation;
        });
    });