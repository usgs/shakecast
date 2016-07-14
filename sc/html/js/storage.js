SC_DEF = (function() {
    // initailise constants
    var DEFAULT_ZOOM = 8,
	DEFAULT_TILE_ZOOM = 1,
	refresh_int = 5,
	event_int = 1,
	lat = 36,
	lon = -120,
	recent_events = 7,
	event_type = 'ACTUAL',
	user = 'guest',
	pass = 'guest',
	slideshow_flag,
	index = localStorage.getItem("index");

    function username(new_user) {
	    if (new_user) {
		    localStorage.setItem("user", new_user);
		    module['user'] = new_user;
	    } else {
		    return module['user'];
	    }
    }

    function password(new_pass) {
	    if (new_pass) {
		    localStorage.setItem("pass", new_pass);
		    module['pass'] = new_pass;
	    } else {
		    return module['pass'];
	    }
    }

    function listAllItems(){  
        for (i=0; i<=localStorage.length-1; i++)  
        {   
            var key = localStorage.key(i);  
            var val = localStorage.getItem(key);   
			module[key] = val;
        }  
	
    }  

    function updateAllItems(param){  
        for (var key in param)  
        {   
            //var key = localStorage.key(i);  
            //var val = localStorage.getItem(key);   
            var val = param[key];  
			if (val) {
				//console.log('set ' + key + ' : ' + val); 
				localStorage.setItem(key, val);
			} else {
				//console.log('remove ' + key + ' : ' + val); 
				localStorage.removeItem(key);
			}
        }  
	
    }  

    var module = {
	    'user': user,
	    'pass': pass,
	    'lat': lat,
	    'lon': lon,
	    'recent_events': recent_events,
	    'event_type': event_type,
	    'DEFAULT_TILE_ZOOM': DEFAULT_TILE_ZOOM,
	    'DEFAULT_ZOOM': DEFAULT_ZOOM,
	    'refresh_int': refresh_int,
	    'event_int': event_int,
	    'slideshow_flag': slideshow_flag,
	    username: username,
	    password: password,
	    listAllItems: listAllItems,
	    updateAllItems: updateAllItems,

        init: function() {
            // define the required options
		   if (localStorage)  listAllItems();
        },
        
    };
    
    return module;
})();

