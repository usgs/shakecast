app.controller('inventoryController', function($scope, $http) {
    
/////// GET FACILITY DATA ////////////
    $scope.fac_data = []
    $scope.filter = {}
    $scope.use_filter = false
    $scope.getFacs = function(lastID=0, filter={}) {
        $http.get('/admin/get/inventory', {params: {last_id: lastID, filter: filter}})
            .then(
                function(response){
                    if (lastID == 0) {
                        cur_fac_pos = 0
                    } else {
                        cur_fac_pos = $scope.fac_data.length
                    }
                    
                    $scope.fac_data = $scope.fac_data.concat(response.data)
                    
                    // make sure we don't try to select a fac that
                    // isn't there
                    if ($scope.fac_data.length <= cur_fac_pos) {
                        $scope.cur_fac = $scope.fac_data.slice(-1)[0]
                        cur_fac_pos = $scope.fac_data.length -1
                    } else {
                        $scope.cur_fac = $scope.fac_data[cur_fac_pos] 
                    }
                    
                    $scope.loadFac(index=cur_fac_pos)
                    $scope.lastID = $scope.fac_data.slice(-1)[0].shakecast_id
                }, 
                function(response){
                    $scope.fac_data = []
                }
            );
    }
    
    $scope.clearFilter = function() {
        $scope.filter = {}
        $scope.fac_data = []
        $scope.getFacs(0)
    }
    
    $scope.getFacsFilter = function(lastID=0, filter={}) {
        $scope.fac_data = []
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
                            message: '',
                            focus: true,
                            draggable: false
                        }
                    }
                });
    
    
    $scope.loadFac = function(index=0, fac=[]) {
        // apply new eq data to the map
        if (fac == false) {
            $scope.cur_fac = $scope.fac_data[index]
        }
        
        $scope.facCenter = {
                        lat: $scope.cur_fac.lat_min,
                        lng: $scope.cur_fac.lon_min,
                        zoom: 12
                    };
                    
        $scope.markers = {
                        facMarker: {
                            lat: $scope.cur_fac.lat_min,
                            lng: $scope.cur_fac.lon_min,
                            focus: true,
                            draggable: false,
                            message: `<table class="table">
                                        <thead>
                                            <th colspan="2">` + $scope.cur_fac.name + `</th>    
                                        </thead>
                                        <tbody>
                                            <tr> 
                                                <th>ID:</th><td>` + $scope.cur_fac.facility_id + `</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2">
                                                    <a class='link'>More Info ></a>
                                                </td>
                                            </tr>
                                        <tbody>
                                      </table>`,

                            getMessageScope: function() {return $scope},
                            compileMessage: true
                        }
                    };
                                        
        if ($scope.cur_fac.html) {
            $scope.markers.facMarker.message = `<table>
                                                    <tr>
                                                        <td>` + $scope.cur_fac.html + `</td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan="2">
                                                            <a class='link'>More Info ></a>
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