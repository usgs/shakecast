MAPAPP = (function() {
    // initailise constants
    var DEFAULT_ZOOM = 8;
    
    // initialise variables
    var map = null,
	detailMapLayer = null,
	mgr = null,
	mc = null,
	fac_mc = null,
	smOverlay = null,
	smImg = null,
	epimarker = null;
        
    function loadSM(bounds, img) {
        // create a new marker to and display it on the map
		if (smOverlay) {
			smOverlay.setMap(null);
		}

		smImg = img;
		smBounds = bounds;
		if (smBounds) {
		smOverlay = new USGSOverlay(bounds, img, map);

		}
		map.setCenter(smBounds.getCenter(), DEFAULT_ZOOM);
    } // addMarker
    
    function addMarker(facility) {
		var lat, lon;
		var icon_type;
		
		if (facility.facility_type == "epicenter") {
			lat = parseFloat(facility.lat);
			lon = parseFloat(facility.lon);
			icon_type =  facility.facility_type;
			icon_type = icon_type.toLowerCase();
		} else {
			lat = parseFloat(facility.latitude);
			lon = parseFloat(facility.longitude);
			icon_type =  facility.facility_type + facility.damage_level;
			icon_type = icon_type.toLowerCase();
		}
		//MAPAPP.addMarker(new google.maps.LatLng(lat, lon), domdata);
		var markerimage  = new google.maps.MarkerImage("/images/" + icon_type + ".png",
			new google.maps.Size(25,25),
			new google.maps.Point(0,0),
			new google.maps.Point(12,12));				
			
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(lat, lon), 
			icon: markerimage,
			map: map,
		});
		//facMarkers.push(marker);
        
    } // addMarker
    
    
    function addLegend(facTypes) {
	if (map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].getArray().length) {
	    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].removeAt(0);
	}

	var typeText = '<img src="/images/epicenter.png" /> Earthquake Epicenter<br />';
        for (var ii in facTypes) {
	    var factype = facTypes[ii];
	    if (factype.facility_count > 0) 
	    typeText = typeText +
	    '<img src="' + factype.url + '" /> ' + factype.facility_type + ' : ' +
	    factype.facility_count + '<br />';
        } // for
	var tableDiv = document.createElement('DIV');
	var tableControl = new LegendControl(tableDiv, map, typeText);
      
	tableDiv.index = 1;
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(tableDiv);
    } // watchHash

    var module = {
        addMarker: addMarker,
		loadSM: loadSM,
        addLegend: addLegend,
        
        init: function(position, zoomLevel, no_facility) {

            // define the required options
            var myOptions = {
                zoom: zoomLevel ? zoomLevel : DEFAULT_ZOOM,
                center: position,
				//overviewMapControl: true,
                //overviewMapControlOptions: {opened: true},

				disableDefaultUI: true,
				mapTypeId: google.maps.MapTypeId.TERRAIN,
            };

            // initialise the map
            map = new google.maps.Map(
                document.getElementById("map_canvas"),
                myOptions);
                
	    /* var map_questMapLayerOptions = {
	    getTileUrl: function(tile, zoom) {
		    //console.debug(X);
		    //return "/server_event.php?x="+tile.x+"&y="+tile.y+"&zoom="+zoom; },
		    var tilesAtThisZoom = 1 << zoom;
		    var tilex = tile.x % tilesAtThisZoom;
		    if (tilex < 0) {tilex = tilex + tilesAtThisZoom;}
		    //if (zoom > TILE_ZOOM) {
			    //return "/scripts/gmap.pl/event/"+tile.x+","+tile.y+","+zoom;
		    //} else {
			    return "./tiles/map_quest/"+zoom+"/"+tilex+"/"+tile.y+".png";
		    //}
		    },
	    tileSize: new google.maps.Size(256, 256),
	    isPng: true
	    };
	    map_questMapLayer = new google.maps.ImageMapType(map_questMapLayerOptions);
	    map.overlayMapTypes.insertAt("0",map_questMapLayer); */

			var detailsMapLayerOptions = {
			getTileUrl: function(tile, zoom) {
				//console.debug(X);
				//return "/server_event.php?x="+tile.x+"&y="+tile.y+"&zoom="+zoom; },
				var tilesAtThisZoom = 1 << zoom;
				var tilex = tile.x % tilesAtThisZoom;
				//if (zoom > TILE_ZOOM) {
					//return "/scripts/gmap.pl/event/"+tile.x+","+tile.y+","+zoom;
				//} else {
					return "./tiles/event/"+zoom+"/"+tilex+"/"+tile.y+".png";
				//}
				},
			tileSize: new google.maps.Size(256, 256),
			isPng: true
			};
			eventMapLayer = new google.maps.ImageMapType(detailsMapLayerOptions);
			//map.overlayMapTypes.insertAt("0",eventMapLayer);
			map.overlayMapTypes.insertAt("1", eventMapLayer);

			var facilityMapLayerOptions = {
			getTileUrl: function(tile, zoom) {
				//console.debug(X);
				//return "/server_event.php?x="+tile.x+"&y="+tile.y+"&zoom="+zoom; },
				//return "/scripts/gmap.pl/facility/"+tile.x+","+tile.y+","+zoom; },
				var tilesAtThisZoom = 1 << zoom;
				var tilex = tile.x % tilesAtThisZoom;
				//if (zoom > TILE_ZOOM) {
				//	return "/scripts/gmap.pl/facility/"+tile.x+","+tile.y+","+zoom;
				//} else {
					return "/html/tiles/facility/"+zoom+"/"+tilex+"/"+tile.y+".png";
				//}
				},
			tileSize: new google.maps.Size(256, 256),
			isPng: true
			};
			facilityMapLayer = new google.maps.ImageMapType(facilityMapLayerOptions);
			if (!no_facility) map.overlayMapTypes.insertAt("2",facilityMapLayer);
			//map.overlayMapTypes.insertAt("1",facilityMapLayer);
	    return map;
        },
        
    };
    
    return module;
})();

/**
 * The HomeControl adds a control to the map that
 * returns the user to the control's defined home.
 */

// Define a property to hold the Home state
LegendControl.prototype.home_ = null;

// Define setters and getters for this property
LegendControl.prototype.getHome = function() {
  return this.home_;
}

LegendControl.prototype.setHome = function(home) {
  this.home_ = home;
}

function LegendControl(controlDiv, map, facTypes) {
 
  // We set up a variable for this since we're adding
  // event listeners later.
  var control = this;
  
  // Set the home property upon construction
  control.facTypes_ = facTypes;
 
  // Set CSS styles for the DIV containing the control
  // Setting padding to 5 px will offset the control
  // from the edge of the map
  controlDiv.style.padding = '5px';
 
  // Set CSS for the control border
  var goHomeUI = document.createElement('DIV'); 
  goHomeUI.style.backgroundColor = 'white';
  goHomeUI.style.borderStyle = 'solid';
  goHomeUI.style.borderWidth = '1px';
  goHomeUI.style.cursor = 'pointer';
  goHomeUI.style.textAlign = 'left';
  controlDiv.appendChild(goHomeUI);
 
  // Set CSS for the control interior
  var goHomeText = document.createElement('DIV');
  goHomeText.style.fontFamily = 'Arial,sans-serif';
  goHomeText.style.fontSize = '12px';
  goHomeText.style.paddingLeft = '4px';
  goHomeText.style.paddingRight = '4px';
  goHomeText.innerHTML = 'Facility Cluster<br/><img src="/images/cluster/m1_1.png" /><img src="/images/cluster/m1_100.png" /><img src="/images/cluster/m1_200.png" /><img src="/images/cluster/m1_300.png" /><img src="/images/cluster/m1_400.png" />';
  goHomeUI.appendChild(goHomeText);
  
  // Set CSS for the setHome control border
  var setHomeUI = document.createElement('DIV');
  setHomeUI.style.backgroundColor = 'white';
  setHomeUI.style.borderStyle = 'solid';
  setHomeUI.style.borderWidth = '1px';
  setHomeUI.style.cursor = 'pointer';
  setHomeUI.style.textAlign = 'left';
  controlDiv.appendChild(setHomeUI);
 
  // Set CSS for the control interior
  var setHomeText = document.createElement('DIV');
  setHomeText.style.fontFamily = 'Arial,sans-serif';
  setHomeText.style.fontSize = '12px';
  setHomeText.style.paddingLeft = '4px';
  setHomeText.style.paddingRight = '4px';
  setHomeText.style.paddingTop = '1px';
  setHomeText.style.paddingBottom = '1px';
  setHomeText.innerHTML = facTypes;
  setHomeUI.appendChild(setHomeText);
 
  // Setup the click event listener for Home:
  // simply set the map to the control's current home property.
  //google.maps.event.addDomListener(goHomeUI, 'click', function() {
  //  var currentHome = control.getHome();
  //  map.setCenter(currentHome);
  //});
  
  // Setup the click event listener for Set Home:
  // Set the control's home to the current Map center.
  //google.maps.event.addDomListener(setHomeUI, 'click', function() {
    /*var newHome = map.getCenter();
    control.setHome(newHome);*/
  //  $('#marker-detail').css('left', '0px');
  //  scrollTo(0, 1);
  //});

}
 

