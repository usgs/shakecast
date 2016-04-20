app.controller('eqController', function($scope, $http, $timeout) {
    // create a message to display in our view
    $http.get('/get/eqdata')
        .then(
            function(response){
                $scope.eq_data = response.data
                $scope.cur_eq = $scope.eq_data[0]
                
                $scope.loadEQ(0)
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
    
    // set default map values that will be overwritten when eq data
    // loads
    angular.extend($scope, {
                    defaults: {
                        scrollWheelZoom: false
                    },
                    eqCenter: {
                        lat: 32,
                        lng: -122,
                        zoom: 4
                    },
                    markers: {
                        eqMarker: {
                            lat: 0,
                            lng: 0,
                            message: '',
                            focus: false,
                            draggable: false
                        }
                    }
                });
    
    $scope.loadEQ = function(index) {
        // apply new eq data to the map
        $timeout(function () {
            $scope.cur_eq = $scope.eq_data[index]
            $scope.eqCenter = {
                            lat: $scope.cur_eq.lat,
                            lng: $scope.cur_eq.lon,
                            zoom: 4
                        };
            $scope.markers = {
                            eqMarker: {
                                lat: $scope.cur_eq.lat,
                                lng: $scope.cur_eq.lon,
                                message: $scope.cur_eq.place,
                                focus: false,
                                draggable: false
                            }
                        };
        }, 100);
    }
    
    
});