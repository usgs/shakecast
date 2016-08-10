MAPAPP = (function() {
    // initailise constants
    var DEFAULT_ZOOM = 8;
    
    // initialise variables
    var map = null,
        mainScreen = true,
        markers = [],
        markerContent = {},
		smOverlay = null,
		smImg = null,
		smBounds = null;
		epimarker = null;
        
    function loadSM(bounds, img, data) {
        // create a new marker to and display it on the map
		if (smOverlay) {
			smOverlay.setMap(null);
			epimarker.setMap(null);
		}

		smImg = img;
		smBounds = bounds;
		if (smBounds) {
		smOverlay = new USGSOverlay(bounds, img, map);

		var event = $(data).find("event");
        var epimarker = new google.maps.Marker({
            position: new google.maps.LatLng(event.attr("lat"), event.attr("lon")), 
            map: map,
            title: "Epicenter",
            icon: 'images/epicenter.png',
        });
			
        // create a simple info window
		var description = "<table border=1><tr bgcolor=#bbbbbb><td colspan=2 align=center><strong>" + 
			event.attr("locstring") + "</strong>" + 
			"<tr><td><table bgcolor=#eeeeee width=100%>" + 
			"<tr><td colspan=3><font size=-1>Event ID: <strong>" + 
			event.attr("id") + "</strong></td></tr>" +
			"<tr><td colspan=2><font size=-1>Magnitude: <strong>" + 
			event.attr("magnitude") + "</strong></td></tr>" +
			"<tr><td><font size=-1>Lat: <strong>" + event.attr("lat") + 
			"<strong></td><td><font size=-1>Lon: <strong>" + event.attr("lon") + "<strong></td>" +
			"<td><font size=-1>Depth: <strong>" + event.attr("depth") + "<strong></td></tr>" +
			"<tr><td colspan=2><font size=-1>Time: <strong>" + event.attr("timestamp") + 
			"<strong></td></tr></table></td></tr></table>";
        var infowindow = new google.maps.InfoWindow({
            content: description
        });

        // capture touch click events for the created marker
        google.maps.event.addListener(epimarker, 'click', function() {
            infowindow.open(map,epimarker);
        });

		map.setCenter(smBounds.getCenter(), DEFAULT_ZOOM);
		//google.maps.event.addListener(map, 'click', handleMapClick);	

		}
    } // addMarker
    
    function activateMarker(marker) {
        // iterate through the markers and set to the inactive image
        for (var ii = 0; ii < markers.length; ii++) {
            markers[ii].setIcon('img/pin-inactive.png');
        } // for
        
        // update the specified marker's icon to the active image
        marker.setIcon('img/pin-active.png');
            
        // update the navbar title using jQuery
        $('#marker-nav .marker-title')
            .html(marker.getTitle())
            .removeClass('has-detail')
            .unbind('click');
            
        // if content has been provided, then add the has-detail
        // class to adjust the display to be "link-like" and 
        // attach the click event handler
        var content = markerContent[marker.getTitle()];
        if (content) {
            $('#marker-nav .marker-title')
                .addClass('has-detail')
                .click(function() {
                    $('#marker-detail .content').html(content);
                    showScreen('marker-detail');
                });
        } // if
        
        // update the marker navigation controls
        updateMarkerNav(getMarkerIndex(marker));
    } // activateMarker
        
    function addMarker(position, title, content) {
        // create a new marker to and display it on the map
        var marker = new google.maps.Marker({
            position: position, 
            map: map,
            title: title,
            icon: 'img/pin-inactive.png'
        });
        
        // save the marker content
        markerContent[title] = content;
        
        // add the marker to the array of markers
        markers.push(marker);
        
        // capture touch click events for the created marker
        google.maps.event.addListener(marker, 'click', function() {
            // activate the clicked marker
            activateMarker(marker);
        });

    } // addMarker
    
    
    function clearMarkers() {
        for (var ii = 0; ii < markers.length; ii++) {
            markers[ii].setMap(null);
        } // for
        
        markers = [];
		
		smOverlay.setMap(null);
		smOverlay = null;

    } // clearMarkers
    
    function getMarkerIndex(marker) {
        for (var ii = 0; ii < markers.length; ii++) {
            if (markers[ii] === marker) {
                return ii;
            } // if
        } // for 
        
        return -1;
    } // getMarkerIndex
    
    function initScreen() {
        // watch for location hash changes
        setInterval(watchHash, 10);

        // next attach a click handler to all close buttons
        $('button.close').click(showScreen);
    } // initScreen
    
    function showScreen(screenId) {
        mainScreen = typeof screenId !== 'string';
        if (typeof screenId === 'string') {
            $('#' + screenId).css('left', '0px');

            // update the location hash to marker detail
            window.location.hash = screenId;
        }
        else {
            $('div.child-screen').css('left', '100%');
            window.location.hash = '';
        } // if..else
        
        scrollTo(0, 1);
    } // showScreen
    
    function sortMarkers() {
        // sort the markers from top to bottom, left to right
        // remembering that latitudes are less the further south we go
        markers.sort(function(markerA, markerB) {
            // get the position of marker A and the position of marker B
            var posA = markerA.getPosition(),
                posB = markerB.getPosition();

            var result = posB.lat() - posA.lat();
            if (result === 0) {
                result = posA.lng() - posB.lng();
            } // if
            
            return result;
        });
    } // sortMarkers
    
    function updateMarkerNav(markerIndex) {
        
        // find the marker nav element
        var markerNav = $('#marker-nav');
        
        // reset the disabled state for the images and unbind click events
        markerNav.find('img')
            .addClass('disabled')
            .unbind('click');
            
        // if we have more markers at the end of the array, then update
        // the marker state
        if (markerIndex < markers.length - 1) {
            markerNav.find('img.right')
                .removeClass('disabled')
                .click(function() {
                    activateMarker(markers[markerIndex + 1]);
                });
        } // if
        
        if (markerIndex > 0) {
            markerNav.find('img.left')
                .removeClass('disabled')
                .click(function() {
                    activateMarker(markers[markerIndex - 1]);
                });
        } // if
    } // updateMarkerNav
    
    function watchHash() {
        // this function monitors the location hash for a reset to empty
        if ((! mainScreen) && (window.location.hash === '')) {
            showScreen();
        } // if
    } // watchHash

    var module = {
        addMarker: addMarker,
        clearMarkers: clearMarkers,
		loadSM: loadSM,
        
        init: function(position, zoomLevel) {
            // define the required options
            var myOptions = {
                zoom: zoomLevel ? zoomLevel : DEFAULT_ZOOM,
                center: position,
                mapTypeControl: true,
                streetViewControl: false,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            };

            // initialise the map
            map = new google.maps.Map(
                document.getElementById("map_canvas"),
                myOptions);
                
            // initialise the screen
            initScreen();
        },
        
        updateDisplay: function() {
		
			//loadSM(smBounds, smImg, null);
            // get the first marker
            var firstMarker = markers.length > 0 ? markers[0] : null;

            // sort the markers
            sortMarkers();

            // if we have at least one marker in the list, then 
            // initialize the first marker
            if (firstMarker) {
                activateMarker(firstMarker);
            } // if
 
       }
    };
    
    return module;
})();

