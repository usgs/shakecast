"""
This app package contains all the code written for pyCast
(ShakeCast V4).

Start the application after pulling from source:
    1. Start the server
    ::
        $ cd /some/dir/shakecast_v4/sc/app/
        $ python server.py
        
    2. Start the CLI
    ::
        $ cd /some/dir/shakecast_v4/sc/        
        $ python ui.py
        
    3. Start USGS monitor (geo_json) and shakemap monitor (check_new_shakemaps) from within the CLI:
    ::
        ShakeCast> start
            
    4. Upload user data from within CLI: (API under construction and *not ready for use*)
    ::
        ShakeCast> import_facility_xml /full/path/to/facility_file.xml
        ShakeCast> import_group_xml /full/path/to/group_file.xml
        ShakeCast> import_user_xml /full/path/to/user_file.xml
        
        
"""
