app.controller("groupController", function($scope, $http) {
    $scope.groupData = []
    $scope.getGroups = function(lastID=0, filter={}) {
        $http.get("/admin/get/groups", {params: {last_id: lastID, filter: filter}})
            .then(
                function(response){
                    if (lastID === 0) {
                        curGroupPos = 0
                    } else {
                        curGroupPos = $scope.groupData.length
                    }
                    
                    $scope.groupData = $scope.groupData.concat(response.data)
                    $scope.lastID = $scope.groupData.slice(-1)[0].shakecast_id
                    
                    // make sure we don't try to select a group that
                    // isn't there
                    if ($scope.groupData.length <= curGroupPos) {
                        $scope.curGroup = $scope.groupData.slice(-1)[0]
                        curGroupPos = $scope.groupData.length -1
                    } else {
                        $scope.curGroup = $scope.groupData[curGroupPos] 
                    }
                    $scope.loadGroup(curGroupPos)
                }, 
                function(){
                    $scope.groupData = []
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
                            fillColor: "blue",
                            color: "blue"
                        }
                    }
                });
    
    
    $scope.loadGroup = function(index=0, group=[]) {
        // apply new eq data to the map
        if (group === false) {
            $scope.curGroup = $scope.groupData[index]
        }
        
        $scope.center = {
                        lat: ($scope.curGroup.lat_min + $scope.curGroup.lat_max) / 2,
                        lng: ($scope.curGroup.lon_min + $scope.curGroup.lon_max) / 2,
                        zoom: 4
                    };
                    
        $scope.paths = {
                        polygon: {
                            latlngs: [[$scope.curGroup.lat_min, $scope.curGroup.lon_min],
                                      [$scope.curGroup.lat_max, $scope.curGroup.lon_min],
                                      [$scope.curGroup.lat_max, $scope.curGroup.lon_max],
                                      [$scope.curGroup.lat_min, $scope.curGroup.lon_max]],
                            type: "polygon",
                            fillColor: "red",
                            color: "red",
                            focus: true
                        }
                    };
                    
        $http.get("/admin/get/groups/" + $scope.curGroup.shakecast_id + "/specs")
                .then(
                    function(response){
                        $scope.curGroup.specs = response.data
                    }
        );
    }

});