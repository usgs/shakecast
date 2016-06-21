app.controller('groupController', function($scope, $http) {
    $scope.group_data = []
    $scope.getGroups = function(lastID=0, filter={}) {
        $http.get('/admin/get/groups', {params: {last_id: lastID, filter: filter}})
            .then(
                function(response){
                    if (lastID == 0) {
                        cur_group_pos = 0
                    } else {
                        cur_group_pos = $scope.group_data.length
                    }
                    
                    $scope.group_data = $scope.group_data.concat(response.data)
                    $scope.lastID = $scope.group_data.slice(-1)[0].shakecast_id
                    
                    // make sure we don't try to select a group that
                    // isn't there
                    if ($scope.group_data.length <= cur_group_pos) {
                        $scope.cur_group = $scope.group_data.slice(-1)[0]
                        cur_group_pos = $scope.group_data.length -1
                    } else {
                        $scope.cur_group = $scope.group_data[cur_group_pos] 
                    }
                    $scope.loadGroup(cur_group_pos)
                }, 
                function(response){
                    $scope.group_data = []
                }
            );
    }
    
    $scope.getGroups(0)
    
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
                    paths: {
                        polygon: {
                            type: "polygon",
                            latlngs: [],
                            fillColor: 'blue',
                            color: 'blue'
                        }
                    }
                });
    
    
    $scope.loadGroup = function(index=0, group=[]) {
        // apply new eq data to the map
        if (group == false) {
            $scope.cur_group = $scope.group_data[index]
        }
        
        $scope.center = {
                        lat: ($scope.cur_group.lat_min + $scope.cur_group.lat_max) / 2,
                        lng: ($scope.cur_group.lon_min + $scope.cur_group.lon_max) / 2,
                        zoom: 4
                    };
                    
        $scope.paths = {
                        polygon: {
                            latlngs: [[$scope.cur_group.lat_min, $scope.cur_group.lon_min],
                                      [$scope.cur_group.lat_max, $scope.cur_group.lon_min],
                                      [$scope.cur_group.lat_max, $scope.cur_group.lon_max],
                                      [$scope.cur_group.lat_min, $scope.cur_group.lon_max]],
                            type: "polygon",
                            fillColor: 'red',
                            color: 'red',
                            focus: true
                        }
                    };
                    
        $http.get('/admin/get/groups/' + $scope.cur_group.shakecast_id + '/specs')
                .then(
                    function(response){
                        $scope.cur_group.specs = response.data
                    }
        );
    }

});