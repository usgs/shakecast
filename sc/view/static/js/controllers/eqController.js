app.controller('eqController', function($scope, $http) {
    // create a message to display in our view
    $http.get('/get/eqdata')
        .then(
            function(response){
                $scope.eq_data = response.data
                $scope.cur_eq = $scope.eq_data[0]
                
                angular.extend($scope, {
                    center: {
                        lat: $scope.cur_eq.lat,
                        lng: $scope.cur_eq.lon,
                        zoom: 4}
                });
            }, 
            function(response){
              $scope.eq_data = 'None'
            }
         );

    angular.extend($scope, {
        center: {
                        lat: 0,
                        lng: 0,
                        zoom: 4},
        defaults: {
            scrollWheelZoom: false
        }
    });
    
    $scope.loadEQ = function(index) {
        $scope.cur_eq = $scope.eq_data[index]
    
        angular.extend($scope, {
                    center: {
                        lat: $scope.cur_eq.lat,
                        lng: $scope.cur_eq.lon,
                        zoom: 4},
                    defaults: {
                        scrollWheelZoom: false
                    }
                });
    }
    
    $scope.locked = []
});