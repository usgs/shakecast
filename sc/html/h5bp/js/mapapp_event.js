MAPAPP = (function() {
    // initailise constants
    var DEFAULT_ZOOM = 8;
    
    // initialise variables
    var map = null,
	sm_id = null,
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
		map.setCenter(smBounds.getCenter(), DEFAULT_ZOOM);
    } // addMarker
    
    function loadInfo(facility_id, point) {
		//console.log(facility_id);
        // create a new marker to and display it on the map
		if (!point) {
			return;
		}
		
		var local_url = '/scripts/facility.pl/from_id/'+facility_id;
		$.getJSON(local_url, function(data) {
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
				  }
				  fac_feature.setMap(map);
				}
			} else {
				var html_array = ['<div class="ui-block-b fac_sum">',
					'<ul><li class="fac_summary"><b>Facility ID</b> : ' + data.external_facility_id + ' (' + data.facility_type + ')</li>',
					'<li class="fac_summary"><b>Name</b> : ' + data.facility_name + '</li>',
					(data.description) ? '<li class="fac_summary"><b>Description</b> : ' + data.description + '</li>' : '',
					'<li class="fac_summary"><b>Latitude</b> : ' + data.lat_min + ' / ' + data.lat_max + '</li>',
					'<li class="fac_summary"><b>Logitude</b> : ' + data.lon_min + ' / ' + data.lon_max + '</li>',
					'<li class="fac_summary"><b>Last Updated</b> : ' + data.update_timestamp + '</li>',
					'</ul></div>',
				];
				infocontent = html_array.join('');
			}
			infowindow.setContent(infocontent);
			infowindow.setPosition(point);
			infowindow.open(map);
		});

    } // addMarker
    
    function addMarker(facility) {
		var lat, lon;
		var markerimage;
		if (facility.facility_type == "epicenter") {
			lat = parseFloat(facility.lat);
			lon = parseFloat(facility.lon);
			//MAPAPP.addMarker(new google.maps.LatLng(lat, lon), domdata);
			 markerimage  = new google.maps.MarkerImage("/images/epicenter.gif",
				new google.maps.Size(25,25),
				new google.maps.Point(0,0),
				new google.maps.Point(12,12));				
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(lat, lon), 
				shadow: markershadow,
				icon: markerimage,
				map: map,
				optimized: false
			});
				var strHtml =  '<span class="lead">M'+ facility.magnitude + '</span> ' + 
				facility.event_location_description +', ' + facility.event_timestamp;				
				if (facility.event_type !="ACTUAL") {strHtml += ' <span class="lead badge badge-important">Earthquake Scenario</span>';}
				$("#map_title").html(strHtml).fadeIn("slow");
			var dmg_url = '/scripts/damage.pl/from_id/'+sm_id+'?action=summary';
			$.getJSON(dmg_url, function(summary) {
				var damage_summary = '<div class="progress">';
				// Are there even any EQ to display?
				if (summary.count > 0) {
					jQuery.each(summary.damage_summary, function(i, val) {
						damage_summary += '<div class="bar ' + bar[i] + '" style="width: ' + val/summary.count*100 + '%;">' + val + '</div>';
					});
				}
				damage_summary += '</div>';
				$("#caption").html(damage_summary);
			});
			var html_array = ['<div class="ui-block-b fac_sum">',
				'<ul><li class="fac_summary"><b>Event ID</b> : ' + facility.event_id + ' (' + facility.event_version + ')</li>',
				'<li class="fac_summary"><b>Name</b> : ' + facility.event_location_description + '</li>',
				'<li class="fac_summary"><b>Magnitude</b> : ' + facility.magnitude,
					(facility.mag_type) ? ' (' + facility.mag_type + ')</li>' : '</li>',
				'<li class="fac_summary"><b>Location (Lat/Lon)</b> : ' + facility.lat + ' / ' + facility.lon + '</li>',
				'<li class="fac_summary"><b>Depth</b> : ' + facility.depth + ' km</li>',
				'<li class="fac_summary"><b>Origin Time</b> : ' + facility.event_timestamp + '</li>',
				'</ul></div>',
			];
			infocontent = html_array.join('');
			google.maps.event.addListener(marker, 'click', 
				function() {
					infowindow.setContent(infocontent);
					infowindow.setPosition(marker.getPosition());
					infowindow.open(map);
				});
		} else {
			lat = (parseFloat(facility.lat_min) + parseFloat(facility.lat_max))/2;
			lon = (parseFloat(facility.lon_min) + parseFloat(facility.lon_max))/2;
			//MAPAPP.addMarker(new google.maps.LatLng(lat, lon), domdata);
			 markerimage  = new google.maps.MarkerImage("/images/" + facility.facility_type + ".png",
				new google.maps.Size(25,25),
				new google.maps.Point(0,0),
				new google.maps.Point(12,12));				
			var markershadow = new google.maps.MarkerImage("/images/shadow-" + facility.facility_type + ".png",
				new google.maps.Size(38,25),
				new google.maps.Point(0,0),
				new google.maps.Point(12,12));			

			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(lat, lon), 
				shadow: markershadow,
				icon: markerimage,
				map: map,
				facility_id: facility.facility_id,
			});
			google.maps.event.addListener(marker, 'click', 
				function() {
				//console.log(marker.facility_id);
				//map.setCenter(marker.getPosition());
				loadInfo(marker.facility_id, marker.getPosition());
				});
		}
			
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
		var eventDiv = document.createElement('DIV'); 
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
		
		var facilityDiv = document.createElement('DIV'); 
		facilityDiv.style.backgroundColor = 'white';
		facilityDiv.style.borderStyle = 'solid';
		facilityDiv.style.borderWidth = '1px';
		facilityDiv.style.cursor = 'pointer';
		facilityDiv.style.textAlign = 'left';
		facilityDiv.title = 'Click to toggle station layer';
		// Set CSS for the control interior
		var facilityText = document.createElement('DIV');
		facilityText.style.fontFamily = 'Arial,sans-serif';
		facilityText.style.fontSize = '12px';
		facilityText.style.paddingLeft = '5px';
		facilityText.style.paddingRight = '5px';
		facilityText.style.paddingTop = '1px';
		facilityText.style.paddingBottom = '1px';
		facilityText.innerHTML = 'Facility Layer';
		facilityDiv.appendChild(facilityText);
		ControlDiv.appendChild(facilityDiv);
		
		var stationDiv = document.createElement('DIV'); 
		stationDiv.style.backgroundColor = 'white';
		stationDiv.style.borderStyle = 'solid';
		stationDiv.style.borderWidth = '1px';
		stationDiv.style.cursor = 'pointer';
		stationDiv.style.textAlign = 'left';
		stationDiv.title = 'Click to toggle station layer';
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
		  if (map.overlayMapTypes.getAt("0")) {
			  map.overlayMapTypes.setAt("0",null);
			  this.style.backgroundColor = 'white';
		  } else {
			  map.overlayMapTypes.setAt("0",stationMapLayer);
			  this.style.backgroundColor = '#aaffaa';
		  }
			  });
		google.maps.event.addDomListener(facilityDiv, 'click', function() {
		  if (map.overlayMapTypes.getAt("2")) {
			  map.overlayMapTypes.setAt("2",null);
			  this.style.backgroundColor = 'white';
		  } else {
			  map.overlayMapTypes.setAt("2",facilityMapLayer);
			  this.style.backgroundColor = '#aaaaff';
		  }
			  });
 
    } // watchHash

   
    var module = {
        addMarker: addMarker,
		loadSM: loadSM,
		loadInfo: loadInfo,
		DEFAULT_ZOOM: DEFAULT_ZOOM,
		infowindow : infowindow,
		removeMarker : removeMarker,
        
        init: function(sc_id, position, zoomLevel) {

			sm_id = sc_id;
            // define the required options
            var myOptions = {
				zoomControl: true,
                zoom: zoomLevel ? zoomLevel : DEFAULT_ZOOM,
				scrollwheel: false,
                center: position,
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
				return "/scripts/gmap.pl/event/"+tile.x+","+tile.y+","+zoom; },
			tileSize: new google.maps.Size(256, 256),
			isPng: true
			};
			eventMapLayer = new google.maps.ImageMapType(detailsMapLayerOptions);
			//map.overlayMapTypes.insertAt("0",eventMapLayer);
			map.overlayMapTypes.insertAt("0",null);
	    
			var facilityMapLayerOptions = {
			getTileUrl: function(tile, zoom) {
				//console.debug(X);
				//return "/server_event.php?x="+tile.x+"&y="+tile.y+"&zoom="+zoom; },
				return "/scripts/gmap.pl/facility/"+tile.x+","+tile.y+","+zoom; },
			tileSize: new google.maps.Size(256, 256),
			isPng: true
			};
			facilityMapLayer = new google.maps.ImageMapType(facilityMapLayerOptions);
			//map.overlayMapTypes.insertAt("1",facilityMapLayer);
			map.overlayMapTypes.insertAt("1",null);
	    
			var stationMapLayerOptions = {
			getTileUrl: function(tile, zoom) {
				//console.debug(X);
				//return "/server_event.php?x="+tile.x+"&y="+tile.y+"&zoom="+zoom; },
				return "/scripts/gmap.pl/station/"+tile.x+","+tile.y+","+zoom; },
			tileSize: new google.maps.Size(256, 256),
			isPng: true
			};
			stationMapLayer = new google.maps.ImageMapType(stationMapLayerOptions);
			//map.overlayMapTypes.insertAt("1",facilityMapLayer);
			map.overlayMapTypes.insertAt("2",null);
	    
			var markerimage  = new google.maps.MarkerImage("/images/query.png",
				new google.maps.Size(25,25),
				new google.maps.Point(0,0),
				new google.maps.Point(12,12));				
			custommarker = new google.maps.Marker({
				position: new google.maps.LatLng(36,-115), 
				icon: markerimage,
				map: map,
				optimized: false,
				draggable: true
			});

			google.maps.event.addListener(custommarker, 'dragend', function(event) {
				google.maps.event.trigger(map, 'click', event);
			});
			
			google.maps.event.addListener(map, 'click', function(event) {
				custommarker.setPosition(event.latLng);
				var local_url = '/scripts/shaking.pl/shaking_point/' + sm_id +
					'?longitude=' + event.latLng.lng() + '&latitude=' + event.latLng.lat();
				$.getJSON(local_url, function(data) {
				var infoContent = '<button class="btn btn-warning" type="button">No Information at Location (' + 
					parseFloat(data.latitude).toFixed(4) + ',' + parseFloat(data.longitude).toFixed(4) + 
					')</button>';
				if (data.point_shaking) {
					var point = data.point_shaking;
					var html_array = [
						'<p><button class="btn btn-success" type="button">Shaking Estimates for Location (' + 
						parseFloat(data.latitude).toFixed(4) + ',' + parseFloat(data.longitude).toFixed(4) + 
						')</button></p>',
						'<div class="content_wrap">',
						'<table><tr style="background-color:#eee;">',
						'<td class="metric"><b>MMI</b><br>' + mmi[parseInt(parseFloat(point.MMI)+0.5)-1] + '</td>',
						'<td class="metric"><b>PGA</b><br>' + parseFloat(point.PGA).toFixed(2) + '  (%g)</td>',
						'<td class="metric"><b>PGV</b><br>' + parseFloat(point.PGV).toFixed(2) + ' (cm/s)</td>',
						(point.PSA03) ? '<td class="metric"><b>PSA03</b><br>' + parseFloat(point.PSA03).toFixed(2) + ' (%g)</td>' : '',
						(point.PSA10) ? '<td class="metric"><b>PSA10</b><br>' + parseFloat(point.PSA10).toFixed(2) + ' (%g)</td>' : '',
						(point.PSA30) ? '<td class="metric"><b>PSA30</b><br>' + parseFloat(point.PSA30).toFixed(2) + ' (%g)</td>' : '',
						'<td class="metric"><b>STDPGA</b><br>' + point.STDPGA + '</td>',
						'<td class="metric"><b>SVEL</b><br>' + parseInt(point.SVEL) + ' (m/s)</td>',
						'</tr></table></div>'
						];
					infoContent = html_array.join('');
				}
				infowindow.setContent(infoContent);
				infowindow.setPosition(event.latLng);
				infowindow.open(map);
				});
			 });
			 
			return map;
        },
        
    };
    
    return module;
})();


