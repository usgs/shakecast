app.controller("eqController", function($scope, $http, $timeout) {
    
    $scope.eqData = []
    $scope.filter = {}
    $scope.filter["all_events"] = false
    $scope.filter["timeframe"] = ""
    // create a message to display in our view
    $scope.getEQs = function(time=$scope.time, filter=$scope.filter) {
        $http.get("/get/eqdata", {params: {time: time, filter: filter}})
            .then(
                function(response){
                    
                    if (time == 0) {
                        curPos = 0
                    } else {
                        curPos = $scope.eqData.length
                    }
                    
                    $scope.eqData = $scope.eqData.concat(response.data)
                    
                    // make sure we don't try to select a fac that
                    // isn't there
                    if ($scope.eqData.length <= curPos) {
                        $scope.curEQ = $scope.eqData.slice(-1)[0]
                        curPos = $scope.eqData.length -1
                    } else {
                        $scope.curEQ = $scope.eqData[curPos] 
                    }
                    
                    $scope.loadEQ(index=curPos)
                    $scope.time = $scope.eqData.slice(-1)[0].time
                }, 
                function(response){
                  $scope.eqData = []
                }
             )
    }
    
    $scope.getEQsFilter = function(time=0, filter=$scope.filter) {
        $scope.eqData = []
        $scope.getEQs(time=time, filter=filter)
    }
    
    $scope.clearFilter = function() {
        $scope.filter = {"all_events": true}
        $scope.eqData = []
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
    })
    
    $scope.getEQs()
    
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
                            message: "",
                            focus: true,
                            draggable: false
                        }
                    },
                    layers: {
                        baselayers: {
                            xyz: {
                                name: "OpenStreetMap (XYZ)",
                                url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                                type: "xyz"
                            }
                        },
                        overlays: {}
                    }
                })
    
    $scope.loadEQ = function(index) {
        // apply new eq data to the map
        $scope.curEQ = $scope.eqData[index]
        
        $scope.eqCenter = {
                        lat: $scope.curEQ.lat,
                        lng: $scope.curEQ.lon,
                        zoom: 7
                    }
                    
        
        $scope.markers = {
                        eqMarker: {
                            lat: $scope.curEQ.lat,
                            lng: $scope.curEQ.lon,
                            message: `<table class="table">
                                        <tr> 
                                            <th>Magnitude:</th><td>` + $scope.curEQ.magnitude + `</td>
                                        </tr>
                                        <tr>
                                            <th>Depth:</th><td>` + $scope.curEQ.depth + `</td>
                                        </tr>
                                        <tr>
                                            <th>Latitude:</th><td>` + $scope.curEQ.lat + `</td>
                                        </tr>
                                        <tr>
                                            <th>Longitude:</th><td>` + $scope.curEQ.lon + `</td>
                                        </tr>
                                        <tr>
                                            <th>Description:</th><td>` + $scope.curEQ.place + `</td>
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
        }
        
        // Remove shakemap if it exists
        if ($scope.layers.overlays.hasOwnProperty("shakemap")) {
            delete $scope.layers.overlays["shakemap"]
        }
        
        $http.get("/get/shakemaps/" + $scope.curEQ.event_id)
            .then(
                function(response) {
                    shakemaps = response.data
                    if (shakemaps.length > 0) {
                        var imageURL = "/get/shakemaps/" + $scope.curEQ.event_id + "/overlay"
                        
                        $scope.layers.overlays["shakemap"] = {
                            name: "ShakeMap",
                            type: "imageOverlay",
                            visible: true,
                            url: imageURL,
                            bounds: [[shakemaps[0].lat_min, shakemaps[0].lon_min],
                                     [shakemaps[0].lat_max, shakemaps[0].lon_max]],
                            layerParams: {
                                opacity: .7,
                                format: "image/png",
                                transparent: true
                            }
                        }
                        
                        $scope.layers.overlays["facilities"] = {
                            name: "Facilities",
                            type: "group",
                            visible: true
                        }
                        
                        $http.get("/get/shakemaps/" + $scope.curEQ.event_id + "/facilities")
                            .then(
                                function(response) {
                                    facs = response.data
                                    for (i=0; i < facs.length; i++) {
                                        fac = facs[i]
                                        facMarker = "fac_" + fac.shakecast_id.toString()
                                        $scope.markers[facMarker] = {
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
                            )
                        
                        
                    } else {
                        delete $scope.layers.overlays["shakemap"]
                    }
                    
                }
            )
            

    }
})