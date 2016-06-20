app.controller('userController', function($scope, $http, leafletData) {
    $scope.user_data = []
    $scope.getUsers = function(lastID=0, filter={}) {
        $http.get('/admin/get/users', {params: {last_id: lastID, filter: filter}})
            .then(
                function(response){
                    if (lastID == 0) {
                        cur_user_pos = 0
                    } else {
                        cur_user_pos = $scope.user_data.length
                    }
                    
                    $scope.user_data = $scope.user_data.concat(response.data)
                    $scope.lastID = $scope.user_data.slice(-1)[0].shakecast_id
                }, 
                function(response){
                    $scope.user_data = []
                }
            );
    }
    
    $scope.getUsers(0)
    
    
    $scope.loadUser = function(index=0, user=[]) {
        // apply new eq data to the map
        if (user == false) {
            $scope.cur_user = $scope.user_data[index]
        }
                    
        $http.get('/admin/get/users/' + $scope.cur_user.shakecast_id + '/groups')
                .then(
                    function(response){
                        $scope.groups = response.data
                        
                        $scope.cur_group = $scope.groups[0]
                        
                        $http.get('/admin/get/groups/' + $scope.cur_group.shakecast_id + '/specs')
                                .then(
                                    function(response){
                                        $scope.cur_group.specs = response.data
                                    }
                                );
                        
                        $scope.center = {
                                        lat: ($scope.cur_group.lat_min + $scope.cur_group.lat_max) / 2,
                                        lng: ($scope.cur_group.lon_min + $scope.cur_group.lon_max) / 2,
                                        zoom: 4
                        };
                        
                        var geoData = {
                                "type": "FeatureCollection",
                                "features": [],
                                "name": "Polygons",
                                "keyField": "GPSUserName"
                            };
                        for (i=0; i < $scope.groups.length; i++) {
                            geoData.features.push({
                                "type": "Feature",
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [[
                                        [$scope.groups[i].lon_min, $scope.groups[i].lat_min],
                                        [$scope.groups[i].lon_min, $scope.groups[i].lat_max],
                                        [$scope.groups[i].lon_max, $scope.groups[i].lat_max],
                                        [$scope.groups[i].lon_max, $scope.groups[i].lat_min]
                                        ]]
                                }
                            });
                        }
                        
                    angular.extend($scope, {
                        geojson: {
                            data: geoData
                        }
                    });
                        
                    }
                );
    }
    
    // MAP SETUP
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
                    groupCenter: {
                        lat: 32,
                        lng: -122,
                        zoom: 10
                    },
                    geojson: ''
                });
    
});