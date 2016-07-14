MAPAPP = (function() {
    // initailise constants
    var DEFAULT_ZOOM = 7;
    var TILE_ZOOM = 9;
    var facilityDiv = null;
    var stationDiv = null;
    var eventDiv = null;
	
    // initialise variables
    var map = null,
	sm_id = null,
	allmarker_flag = null,
	detailMapLayer = null,
	mgr = null,
	mc = null,
	fac_mc = null,
	infowindow = null,
	smOverlay = null,
	smImg = null,
	facilityMapLayer = null,
	eventMapLayer = null,
	epimarker = null;
	fac_feature = null;
	custommarker = null;
    var customDiv = { 'eqCont' : null, 'eqTab': null };
	var facMarkers = [];
        
	infowindow = new google.maps.InfoWindow({
		content: 'content'
	});

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
		//map.setCenter(smBounds.getCenter(), DEFAULT_ZOOM);
    } // addMarker
    
    function removeSM() {
        // create a new marker to and display it on the map
		if (smOverlay) {
			smOverlay.setMap(null);
		}

    } // addMarker
    
    function loadInfo(facility_id, point) {
		//console.log(facility_id);
        // create a new marker to and display it on the map
		if (!point) {
			return;
		}
		
		//var local_url = '/scripts/facility.pl/from_id/'+facility_id;
		var local_url = '/scripts/r/facility/from_id/'+facility_id;
		$.post(local_url, submit_data, function(data) {
			var infocontent = '';
			if (data.feature.length) {
				infocontent = data.feature[0].description;
				//console.log(data.feature[0].description);
				if (data.feature[0].geom) {
				  var feature_coords = [];
					var coord_str = data.feature[0].geom;
					var coords = coord_str.split(" ");
					for (i=0; i < coords.length; i++) {
						var latlon_str = coords[i];
						var latlon = latlon_str.split(",");
						if (latlon.length >= 2) {
							feature_coords.push(new google.maps.LatLng(latlon[1],latlon[0]));
						}
					}
					if (fac_feature) fac_feature.setMap();
					if (data.feature[0].geom_type == 'POLYLINE') {
				  fac_feature = new google.maps.Polyline({
				    clickable: false,
					path: feature_coords,
					strokeColor: "#FFFF00",
					strokeOpacity: 1.0,
					strokeWeight: 3
				  });
				   } else if (data.feature[0].geom_type == 'POLYGON') {
				  fac_feature = new google.maps.Polygon({
				    clickable: false,
					path: feature_coords,
					strokeColor: "#FFFF00",
					strokeOpacity: 1.0,
					strokeWeight: 3,
					fillColor: "#FFFF00",
					fillOpacity: 0.35
				  });
				   } else if (data.feature[0].geom_type == 'RECTANGLE') {
				  fac_feature = new google.maps.Rectangle({
				    clickable: false,
					bounds: new google.maps.LatLngBounds(feature_coords[0],feature_coords[1]),
					strokeColor: "#FFFF00",
					strokeOpacity: 1.0,
					strokeWeight: 3,
					fillColor: "#FFFF00",
					fillOpacity: 0.35
				  });
				   } else if (data.feature[0].geom_type == 'POINT') {
				  fac_feature = new google.maps.Marker({
				    clickable: false,
					position: feature_coords[0],
				  });
				  }
				  fac_feature.setMap(map);
				}
			} else {
				var html_array = [
					'<div  class="panel panel-success"><div class="panel-heading text-center"><h4>Facility Information</h4></div>',
					'<table class="table table-striped table-responsive">',
					'<tr><td><b>Facility ID</b></td><td>' + data.external_facility_id + ' (' + data.facility_type + ')</td></tr>',
					'<tr><td><b>Description</b></td><td>' + data.facility_name + '</td></tr>',
					(data.description) ? '<tr><td><b>Description</b></td><td>' + data.description + '</td></tr>' : '',
					'<tr><td><b>Latitude</b></td><td>' + data.lat_min + ' / ' + data.lat_max + '</td></tr>',
					'<tr><td><b>Logitude</b></td><td>' + data.lon_min + ' / ' + data.lon_max + '</td></tr>',
					'<tr><td><b>Last Updated</b></td><td>' + data.update_timestamp + '</td></t>',
					'</table></div>',
				];
				infocontent = html_array.join('');
			}
			infowindow.setContent(infocontent);
			infowindow.setPosition(point);
			infowindow.open(map);
		}, 'json');

    } // addMarker
    
    function addMarker(facility) {
		var lat, lon;
		var markerimage;
		lat = parseFloat(facility.lat);
		lon = parseFloat(facility.lon);
		var epipng = "/images/epicenter_" + Math.round(facility.opacity*10) + ".png";
		//MAPAPP.addMarker(new google.maps.LatLng(lat, lon), domdata);
		 markerimage  = new google.maps.MarkerImage(epipng,
			new google.maps.Size(25,25),
			new google.maps.Point(0,0),
			new google.maps.Point(12,12));				
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(lat, lon), 
			icon: markerimage,
			fillOpacity: 0.5,
			map: map,
			title: 'M' + facility.magnitude + ' ' + facility.event_location_description,
			optimized: false
		});
		var html_array = [
			'<div  class="panel panel-info"><div class="panel-heading text-center"><h4>Earthquake Information</h4></div>',
			'<table class="table table-striped table-responsive">',
			'<tr><td><b>Event ID</b></td><td>' + facility.event_id + '</td></tr>',
			'<tr><td><b>Description</b></td><td>' + facility.event_location_description + '</td></tr>',
			'<tr><td><b>Magnitude</b></td><td>' + facility.magnitude,
			    (facility.mag_type) ? ' (' + facility.mag_type + ')</td></tr>' : '</td></tr>',
			'<tr><td><b>Location (Lat/Lon)</b></td><td>' + facility.lat + ' / ' + facility.lon + '</td></tr>',
			'<tr><td><b>Depth</b></td><td>' + facility.depth + ' km</td></tr>',
			'<tr><td><b>Origin Time</b></td><td>' + facility.event_timestamp + '</td></t>',
			'</table></div>',
		];
		var infocontent = html_array.join('');
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(infocontent);
			infowindow.setPosition(marker.getPosition());
			infowindow.open(map);
	
			sm_id = facility.shakemap_id + '-' + facility.shakemap_version;
			//var sm_url = '/scripts/shakemap.pl/from_id/' + sm_id;
			var sm_url = '/scripts/r/shakemap/from_id/' + sm_id;
			$.post(sm_url, submit_data, function(data) {
				$("#map_title").html('');
				var lat_min = parseFloat(data.lat_min);
				var lat_max = parseFloat(data.lat_max);
				var lon_min = parseFloat(data.lon_min);
				var lon_max = parseFloat(data.lon_max);

				var rectBounds = new google.maps.LatLngBounds(
					new google.maps.LatLng(lat_min, lon_min),
					new google.maps.LatLng(lat_max, lon_max));
				var img = '/data/'+ sm_id +'/ii_overlay.png';
				var latlng = new google.maps.LatLng((lat_min+lat_max)/2, (lon_min+lon_max)/2);

				//map = MAPAPP.init(latlng, 8);

				loadSM(rectBounds, img);
				var html_array = ['<a href="?dest=event&event=' + sm_id + '"><h3>M'+ data.magnitude,
						(facility.mag_type) ? ' (' + facility.mag_type + ') ' : ' ',
						'<small>' + data.event_location_description,
						', ' + data.event_timestamp,
						'</small></h3></a> ',
				];
				var strHtml =  html_array.join('');				
				if (data.event_type !="ACTUAL") {strHtml += '<span class="lead label label-danger pull-right">Earthquake Scenario</span>';}
				$("#map_title").html(strHtml).fadeIn("slow");
				$("#notification").html('');
				if (data.notification) {
					var notif_html = ['<div class="alert alert-warning"><button type="button" class="close" data-dismiss="alert">&times;</button>Notification Delivery Status : '];
					jQuery.each(data.notification, function(i, val) {
						notif_html.push('<span class="label ' + 
						notification[val.delivery_status] + '">' + val.username);
						if (val.tries) {
							notif_html.push(' <span class="ui-li-count">(' + val.delivery_timestamp + ')</span>');
						}
						notif_html.push('</span> ');
					});
					notif_html.push('</div>');
					$("#notification").html(notif_html.join(''));
				}
			}, 'json');
			//var dmg_url = '/scripts/damage.pl/from_id/'+sm_id+'?action=summary';
			var dmg_url = '/scripts/r/damage/from_id/'+sm_id;
			var all = (allmarker_flag) ? 1 : 0;
			$.post(dmg_url, $.extend(submit_data, {action:'summary', all:all}), function(summary) {
				var damage_summary = '<div class="progress">';
				// Are there even any EQ to display?
				if (summary.count > 0) {
					jQuery.each(summary.damage_summary, function(i, val) {
						damage_summary += '<div class="progress-bar ' + bar[i] + '" style="width:20%;">' + val + '</div>';
					});
				}
				damage_summary += '</div>';
				$("#caption").html(damage_summary);
			}, 'json');
		});
			
		facMarkers[facility.event_id] = marker;
        
    } // addMarker
    
    function addFacMarker(facility) {
		var lat, lon;
		var markerimage;
		if (facility.facility_type == 'STA') {
			lat = facility.latitude;
			lon = facility.longitude;
		} else {
			var lat_min = parseFloat(facility.lat_min);
			var lat_max = parseFloat(facility.lat_max);
			var lon_min = parseFloat(facility.lon_min);
			var lon_max = parseFloat(facility.lon_max);
			lat = (lat_min+lat_max)/2;
			lon = (lon_min+lon_max)/2;
		}
		console.log(facility.latitude + ' ' + lon);
		var epipng = "/images/" + facility.facility_type.toLowerCase() + ".png";
		//MAPAPP.addMarker(new google.maps.LatLng(lat, lon), domdata);
		 markerimage  = new google.maps.MarkerImage(epipng,
			new google.maps.Size(25,25),
			new google.maps.Point(0,0),
			new google.maps.Point(12,12));				
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(lat, lon), 
			icon: markerimage,
			fillOpacity: 0.5,
			map: map,
			title: 'M' + facility.magnitude + ' ' + facility.event_location_description,
			optimized: false
		});
		var html_array = ['<div class="ui-block-b fac_sum">',
			'<ul><li class="fac_summary"><b>Facility ID</b> : ' + facility.external_facility_id + '</li>',
			'<li class="fac_summary"><b>Type</b> : ' + facility.type + '</li>',
			'<li class="fac_summary"><b>Name</b> : ' + facility.name + '</li>',
			'<li class="fac_summary"><b>Latitude</b> : ' + facility.latitude + '</li>',
			'<li class="fac_summary"><b>Longitude</b> : ' + facility.longitude + '</li>',
			'<li class="fac_summary"><b>Description</b> : ' + facility.description + '</li>',
			'</ul></div>',
		];
		loadInfo(facility.facility_id, new google.maps.LatLng(lat, lon));
		var infocontent = html_array.join('');
		google.maps.event.addListener(marker, 'click', 
			function() {
				infowindow.setContent(infocontent);
				infowindow.setPosition(marker.getPosition());
				infowindow.open(map);
		
			});

		facMarkers[facility.facility_id] = marker;
        
    } // addMarker
    
    function removeMarker(event_id) {
        // create a new marker to and display it on the map
		if (facMarkers[event_id]) {
			facMarkers[event_id].setMap(null);
		}

    } // addMarker
    
     function addControl(eqTable) {
		// Create the legend and display on map
		ControlDiv = document.createElement('DIV');
		ControlDiv.style.paddingTop = '5px';

		ControlDiv.index = 1;
		customDiv['eqCont'] = map.controls[google.maps.ControlPosition.TOP_RIGHT].push(ControlDiv);

		//map.setCenter(overlays[0].bounds.getCenter(), DEFAULT_ZOOM);
		// Set CSS for the control border
		// Set CSS for the control border
		eventDiv = document.createElement('DIV'); 
		eventDiv.style.backgroundColor = 'white';
		eventDiv.style.borderStyle = 'solid';
		eventDiv.style.borderWidth = '1px';
		eventDiv.style.cursor = 'pointer';
		eventDiv.style.textAlign = 'left';
		eventDiv.title = 'Click to toggle background seismicity layer';
		// Set CSS for the control interior
		var eventText = document.createElement('DIV');
		eventText.style.fontFamily = 'Arial,sans-serif';
		eventText.style.fontSize = '12px';
		eventText.style.paddingLeft = '5px';
		eventText.style.paddingRight = '5px';
		eventText.style.paddingTop = '1px';
		eventText.style.paddingBottom = '1px';
		eventText.innerHTML = 'Earthquake Layer';
		eventDiv.appendChild(eventText);
		ControlDiv.appendChild(eventDiv);
		
		stationDiv = document.createElement('DIV'); 
		stationDiv.style.backgroundColor = 'white';
		stationDiv.style.borderStyle = 'solid';
		stationDiv.style.borderWidth = '1px';
		stationDiv.style.cursor = 'pointer';
		stationDiv.style.textAlign = 'left';
		stationDiv.title = 'Click to toggle background station layer';
		// Set CSS for the control interior
		var stationText = document.createElement('DIV');
		stationText.style.fontFamily = 'Arial,sans-serif';
		stationText.style.fontSize = '12px';
		stationText.style.paddingLeft = '5px';
		stationText.style.paddingRight = '5px';
		stationText.style.paddingTop = '1px';
		stationText.style.paddingBottom = '1px';
		stationText.innerHTML = 'Station Layer';
		stationDiv.appendChild(stationText);
		ControlDiv.appendChild(stationDiv);
		
		google.maps.event.addDomListener(eventDiv, 'click', function() {
		  if (map.overlayMapTypes.getAt("1")) {
			  map.overlayMapTypes.setAt("1",null);
			  this.style.backgroundColor = 'white';
		  } else {
			  map.overlayMapTypes.setAt("1",eventMapLayer);
			  this.style.backgroundColor = '#ffbff5';
		  }
			  });
		google.maps.event.addDomListener(stationDiv, 'click', function() {
		  if (map.overlayMapTypes.getAt("3")) {
			  map.overlayMapTypes.setAt("3",null);
			  this.style.backgroundColor = 'white';
		  } else {
			  map.overlayMapTypes.setAt("3",stationMapLayer);
			  this.style.backgroundColor = '#aaffaa';
		  }
			  });
 
    } // watchHash

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
        addFacMarker: addFacMarker,
	loadSM: loadSM,
	loadInfo: loadInfo,
	DEFAULT_ZOOM: DEFAULT_ZOOM,
	infowindow : infowindow,
	removeSM : removeSM,
	removeMarker : removeMarker,
	facMarkers : facMarkers,
        addLegend: addLegend,
        
        init: function(user_options) {

	    if (user_options.DEFAULT_TILE_ZOOM) 
		    TILE_ZOOM = parseInt(user_options.DEFAULT_TILE_ZOOM);
	    if (user_options.allmarker_flag) 
		    allmarker_flag = 1;
			//sm_id = sc_id;
            // define the required options
            var myOptions = {
				zoomControl: true,
                zoom: user_options.DEFAULT_ZOOM ? parseInt(user_options.DEFAULT_ZOOM) : DEFAULT_ZOOM,
				scrollwheel: user_options.scrollwheel_zoom_flag ? true : false,
                center: user_options.lat ? 
					new google.maps.LatLng(parseInt(user_options.lat),parseInt(user_options.lon)) : 
					new google.maps.LatLng(35,-120),
				disableDefaultUI: true,
                mapTypeControl: true,
				panControl: false,
				scaleControl: true,
				overviewMapControl: true,
                mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
 				},
 				mapTypeId: google.maps.MapTypeId.TERRAIN,
	    };

	    // initialise the map
	    map = new google.maps.Map(
		document.getElementById("map_canvas"),
		myOptions);
		  
	    addControl();
    
	    var detailsMapLayerOptions = {
	    getTileUrl: function(tile, zoom) {
		    //console.debug(X);
		    //return "/server_event.php?x="+tile.x+"&y="+tile.y+"&zoom="+zoom; },
		    var tilesAtThisZoom = 1 << zoom;
		    var tilex = tile.x % tilesAtThisZoom;
		    if (tilex < 0) {tilex = tilex + tilesAtThisZoom;}
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
	    map.overlayMapTypes.insertAt("1",null);
	    if (user_options.event_layer_flag)
		$(eventDiv).trigger("click");
    
	    var facilityMapLayerOptions = {
	    getTileUrl: function(tile, zoom) {
		    //console.debug(X);
		    //return "/server_event.php?x="+tile.x+"&y="+tile.y+"&zoom="+zoom; },
		    //return "/scripts/gmap.pl/facility/"+tile.x+","+tile.y+","+zoom; },
		    var tilesAtThisZoom = 1 << zoom;
		    var tilex = tile.x % tilesAtThisZoom;
		    if (tilex < 0) {tilex = tilex + tilesAtThisZoom;}
		    if (zoom > TILE_ZOOM) {
		    //	return "/scripts/gmap.pl/facility/"+tile.x+","+tile.y+","+zoom;
		    //} else {
			    return "./tiles/facility/"+zoom+"/"+tilex+"/"+tile.y+".png";
		    }
		    },
	    tileSize: new google.maps.Size(256, 256),
	    isPng: true
	    };
	    facilityMapLayer = new google.maps.ImageMapType(facilityMapLayerOptions);
	    if (user_options.facility_layer_flag) map.overlayMapTypes.insertAt("2",facilityMapLayer);
		
	    var stationMapLayerOptions = {
	    getTileUrl: function(tile, zoom) {
		    //console.debug(X);
		    //return "/server_event.php?x="+tile.x+"&y="+tile.y+"&zoom="+zoom; },
		    var tilesAtThisZoom = 1 << zoom;
		    var tilex = tile.x % tilesAtThisZoom;
		    if (tilex < 0) {tilex = tilex + tilesAtThisZoom;}
		    if (zoom > TILE_ZOOM) {
		    //	return "/scripts/gmap.pl/station/"+tile.x+","+tile.y+","+zoom;
		    //} else {
			    return "./tiles/station/"+zoom+"/"+tilex+"/"+tile.y+".png";
		    }
		    },
	    tileSize: new google.maps.Size(256, 256),
	    isPng: true
	    };
	    stationMapLayer = new google.maps.ImageMapType(stationMapLayerOptions);
	    //map.overlayMapTypes.insertAt("1",facilityMapLayer);
	    map.overlayMapTypes.insertAt("3",null);
	    if (user_options.station_layer_flag)
		$(stationDiv).trigger("click");
    
	    var markerimage  = new google.maps.MarkerImage("/images/query.png",
		    new google.maps.Size(25,25),
		    new google.maps.Point(0,0),
		    new google.maps.Point(12,12));				
	    custommarker = new google.maps.Marker({
		    position: new google.maps.LatLng(0,0), 
		    icon: markerimage,
		    map: map,
		    optimized: false,
		    draggable: true
	    });
    
	    google.maps.event.addListener(custommarker, 'dragend', function(event) {
		    google.maps.event.trigger(map, 'click', event);
	    });
	    
	    google.maps.event.addListener(map, 'rightclick', function(event) {
		custommarker.setPosition(event.latLng);
		//var local_url = '/scripts/shaking.pl/shaking_point/' + sm_id +
		var local_url = '/scripts/r/shaking/shaking_point/' + sm_id +
			'?longitude=' + event.latLng.lng() + '&latitude=' + event.latLng.lat();
		$.post(local_url, $.extend(submit_data, {'longitude': event.latLng.lng(), 'latitude': event.latLng.lat()})
			, function(data) {
		var infoContent = '<div  class="panel panel-warning"><div class="panel-heading text-center">' +
			'<h4>No Information at Location (' + 
			parseFloat(data.latitude).toFixed(4) + ',' + parseFloat(data.longitude).toFixed(4) + 
			')</h4></div>';
		if (data.point_shaking) {
		    var point = data.point_shaking;
		    var html_array = [
			'<div  class="panel panel-success"><div class="panel-heading text-center">',
			'<h4>Grund Motion Estimates</h4></div>',
			'<table class="table table-responsive table-striped">',
			'<tr><td><strong>Loation (Lat/Lon)</strong></td>',
			'<td>' + parseFloat(data.latitude).toFixed(4) + ' / ' + parseFloat(data.longitude).toFixed(4) + '</td></tr>',
			'<tr><td><strong>MMI</strong></td>',
			'<td>' + mmi[parseInt(parseFloat(point.MMI)+0.5)-1] + '</td></tr>',
			'<td><strong>PGA (%g)</strong></td>',
			'<td>' + parseFloat(point.PGA).toFixed(2) + '</td></tr>',
			'<td><strong>PGV (cm/s)</strong></td>',
			'<td>' + parseFloat(point.PGV).toFixed(2) + '</td></tr>',
			(point.PSA03) ? '<tr><td><strong>PSA03 (%g)</strong></td><td>' + parseFloat(point.PSA03).toFixed(2) + '</td></tr>' : '',
			(point.PSA10) ? '<tr><td><strong>PSA10 (%g)</strong></td><td>' + parseFloat(point.PSA10).toFixed(2) + '</td></tr>' : '',
			(point.PSA30) ? '<tr><td><strong>PSA30 (%g)</strong></td><td>' + parseFloat(point.PSA30).toFixed(2) + '</td></tr>' : '',
			'<tr><td><strong>STDPGA</strong></td>',
			'<td>' + point.STDPGA + '</td></tr>',
			'<td><strong>SVEL (m/s)</strong></td>',
			'<td>' + parseInt(point.SVEL) + '</td></tr>',
			'</table></div>'
			];
		    infoContent = html_array.join('');
		}
		infowindow.setContent(infoContent);
		infowindow.setPosition(event.latLng);
		infowindow.open(map);
		}, 'json');
	     });
	     
	    google.maps.event.addListener(map, 'zoom_changed', function() {
		MAPAPP.infowindow.close();
	    });
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
 

