    function menu_update(){
        //var sm_url = '/scripts/shakemap.pl/from_id/' + sc_id;
        var username = SC_DEF.user ? SC_DEF.user : 'guest';
        var password = SC_DEF.pass ? SC_DEF.pass : 'guest';
        //var sm_url = '/scripts/user.pl/from_id/'+username;
        var sm_url = '/scripts/r/user/from_id/'+username;
        var submit_data = {
            'username': username,
            'password': password,
        };
        
        $.post(sm_url, submit_data, function(data) {
            // Are there even any EQ to display?
            if (data.user_type == 'ADMIN') {
              $("#nav_menu").append("<li><a href='?dest=admin_index'>"
                  +"Administration Panel [" + username + "]</a></li>");
            }
            
        }, "json");

    }

    $(document).ready(function() {
        $.ajaxSetup({
            'beforeSend' : function() {
                $('#spinner').show();
            },
        'complete'   : function() {
                $('#spinner').hide();
            },
        'ajaxStop'   : function() {
                $('#spinner').hide();
            },
        'ajaxError'   : function() {
                $('#spinner').hide();
            }
        });
    });
    

function gup( name ) {
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var tmpURL = window.location.href;
  var results = regex.exec( tmpURL );
  if( results == null )
    return "";
  else
    return results[1];
}

function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  return "Basic " + hash;
}

function user_auth(submit_data) {
    var username = submit_data.username
    var sm_url = '/scripts/r/user/from_id/'+username;
        
    $.post(sm_url, submit_data, function(data) {
	  // Are there even any EQ to display?
	  if (data.user_type != 'ADMIN') {
	    alert("The user "+username+" does not have administration privileges.");
	    window.location.replace("/html/preference.html");
	  }
          load_list();
      }, "json")
      .error(function() {
	alert("The user "+username+" does not have administration privileges.");
	window.location.replace("/html/preference.html");
	});
      
}

