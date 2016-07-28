app.controller('eqController', function($scope, $http, $timeout) {
    
    $scope.eq_data = []
    $scope.filter = {}
    $scope.filter['all_events'] = false
    $scope.filter['timeframe'] = ''
    // create a message to display in our view
    $scope.getEQs = function(time=$scope.time, filter=$scope.filter) {
        $http.get('/get/eqdata', {params: {time: time, filter: filter}})
            .then(
                function(response){
                    
                    if (time == 0) {
                        cur_pos = 0
                    } else {
                        cur_pos = $scope.eq_data.length
                    }
                    
                    $scope.eq_data = $scope.eq_data.concat(response.data)
                    
                    // make sure we don't try to select a fac that
                    // isn't there
                    if ($scope.eq_data.length <= cur_pos) {
                        $scope.cur_eq = $scope.eq_data.slice(-1)[0]
                        cur_pos = $scope.eq_data.length -1
                    } else {
                        $scope.cur_eq = $scope.eq_data[cur_pos] 
                    }
                    
                    $scope.loadEQ(index=cur_pos)
                    $scope.time = $scope.eq_data.slice(-1)[0].time
                }, 
                function(response){
                  $scope.eq_data = []
                }
             );
    };
    
    $scope.getEQsFilter = function(time=0, filter=$scope.filter) {
        $scope.eq_data = []
        $scope.getEQs(time=time, filter=filter)
    }
    
    $scope.clearFilter = function() {
        $scope.filter = {'all_events': true}
        $scope.eq_data = []
        $scope.getEQs(0)
    }

    angular.extend($scope, {
        center: {
                        lat: 0,
                        lng: 0,
                        zoom: 4},
        defaults: {
            scrollWheelZoom: false
        }
    });
    
    $scope.getEQs();
    
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
                            focus: true,
                            draggable: false
                        }
                    },
                    layers: {
                        baselayers: {
                            xyz: {
                                name: 'OpenStreetMap (XYZ)',
                                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                type: 'xyz'
                            }
                        },
                        overlays: {}
                    }
                });
    
    $scope.loadEQ = function(index) {
        // apply new eq data to the map
        $scope.cur_eq = $scope.eq_data[index]
        
        $scope.eqCenter = {
                        lat: $scope.cur_eq.lat,
                        lng: $scope.cur_eq.lon,
                        zoom: 7
                    };
                    
        
        $scope.markers = {
                        eqMarker: {
                            lat: $scope.cur_eq.lat,
                            lng: $scope.cur_eq.lon,
                            message: `<table class="table">
                                        <tr> 
                                            <th>Magnitude:</th><td>` + $scope.cur_eq.magnitude + `</td>
                                        </tr>
                                        <tr>
                                            <th>Depth:</th><td>` + $scope.cur_eq.depth + `</td>
                                        </tr>
                                        <tr>
                                            <th>Latitude:</th><td>` + $scope.cur_eq.lat + `</td>
                                        </tr>
                                        <tr>
                                            <th>Longitude:</th><td>` + $scope.cur_eq.lon + `</td>
                                        </tr>
                                        <tr>
                                            <th>Description:</th><td>` + $scope.cur_eq.place + `</td>
                                        </tr>
                                      </table>`,
                            focus: true,
                            draggable: false,
                            popupOptions: {
                                keepInView: false,
                                autoPan: false
                            },
                            getMessageScope: function() {return $scope},
                            compileMessage: true
                        }
        };
        
        // Remove shakemap if it exists
        if ($scope.layers.overlays.hasOwnProperty('shakemap')) {
            delete $scope.layers.overlays['shakemap']
        }
        
        $http.get('/get/shakemaps/' + $scope.cur_eq.event_id)
            .then(
                function(response) {
                    shakemaps = response.data
                    if (shakemaps.length > 0) {
                        var image_url = '/get/shakemaps/' + $scope.cur_eq.event_id + '/overlay'
                        
                        $scope.layers.overlays['shakemap'] = {
                            name: 'ShakeMap',
                            type: 'imageOverlay',
                            visible: true,
                            url: image_url,
                            bounds: [[shakemaps[0].lat_min, shakemaps[0].lon_min],
                                     [shakemaps[0].lat_max, shakemaps[0].lon_max]],
                            layerParams: {
                                opacity: .7,
                                format: 'image/png',
                                transparent: true
                            }
                        }
                        
                        $scope.layers.overlays['facilities'] = {
                            name: 'Facilities',
                            type: 'group',
                            visible: true
                        }
                        
                        $http.get('/get/shakemaps/' + $scope.cur_eq.event_id + '/facilities')
                            .then(
                                function(response) {
                                    facs = response.data
                                    for (i=0; i < facs.length; i++) {
                                        fac = facs[i]
                                        fac_marker = 'fac_' + fac.shakecast_id.toString()
                                        $scope.markers[fac_marker] = {
                                            lat: fac.lat_min,
                                            lng: fac.lon_min,
                                            message: `<table class="table">
                                                        <tr> 
                                                            <th>Facility:</th><td>` + fac.name + `</td>
                                                        </tr>
                                                     </table>`
                                        }
                                        
                                    }
                                }
                            );
                        
                        
                    } else {
                        delete $scope.layers.overlays['shakemap']
                    }
                    
                }
            );
            

    }
});