app.controller("inventoryController", function($scope, $http) {
    
/////// GET FACILITY DATA ////////////
    $scope.facData = []
    $scope.filter = {}
    $scope.use_filter = false
    $scope.getFacs = function(lastID=0, filter={}) {
        $http.get("/admin/get/inventory", {params: {last_id: lastID, filter: filter}})
            .then(
                function(response){
                    if (lastID == 0) {
                        curFacPos = 0
                    } else {
                        curFacPos = $scope.facData.length
                    }
                    
                    $scope.facData = $scope.facData.concat(response.data)
                    
                    // make sure we don't try to select a fac that
                    // isn't there
                    if ($scope.facData.length <= curFacPos) {
                        $scope.curFac = $scope.facData.slice(-1)[0]
                        curFacPos = $scope.facData.length -1
                    } else {
                        $scope.curFac = $scope.facData[curFacPos] 
                    }
                    
                    if ($scope.facData.length > 0) {
                        $scope.loadFac(index=curFacPos)
                        $scope.lastID = $scope.facData.slice(-1)[0].shakecast_id
                    } else {
                        
                    }
                }, 
                function(response){
                    $scope.facData = []
                }
            );
    }
    
    $scope.clearFilter = function() {
        $scope.filter = {}
        $scope.facData = []
        $scope.getFacs(0)
    }
    
    $scope.getFacsFilter = function(lastID=0, filter={}) {
        $scope.facData = []
        $scope.getFacs(lastID=lastID, filter=filter)
    }
    
    $scope.getFacs(0)
    
//////////// MAP SETTINGS ////////////       
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
                    facCenter: {
                        lat: 32,
                        lng: -122,
                        zoom: 10
                    },
                    markers: {
                        facMarker: {
                            lat: 0,
                            lng: 0,
                            message: "",
                            focus: false,
                            draggable: false
                        }
                    }
                });
    
    
    $scope.loadFac = function(index=0, fac=[]) {
        // apply new eq data to the map
        if (fac == false) {
            $scope.curFac = $scope.facData[index]
        }
        
        $scope.facCenter = {
                        lat: $scope.curFac.lat_min,
                        lng: $scope.curFac.lon_min,
                        zoom: 12
                    };
                    
        $scope.markers = {
                        facMarker: {
                            lat: $scope.curFac.lat_min,
                            lng: $scope.curFac.lon_min,
                            focus: true,
                            draggable: false,
                            message: `<table class="table">
                                        <thead>
                                            <th colspan="2">` + $scope.curFac.name + `</th>    
                                        </thead>
                                        <tbody>
                                            <tr> 
                                                <th>ID:</th><td>` + $scope.curFac.facility_id + `</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2">
                                                    <a class="link">More Info</a>
                                                </td>
                                            </tr>
                                        <tbody>
                                      </table>`,

                            getMessageScope: function() {return $scope},
                            compileMessage: true
                        }
                    };
                                        
        if ($scope.curFac.html) {
            $scope.markers.facMarker.message = `<table>
                                                    <tr>
                                                        <td>` + $scope.curFac.html + `</td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan="2">
                                                            <a class="link">More Info</a>
                                                        </td>
                                                    </tr>
                                                </table>`
                                                    
                        
        }
    }
    
    $scope.showFilter = false
    
    isEmpty = function(obj) {
        return Object.keys(obj).length === 0;
    }
});