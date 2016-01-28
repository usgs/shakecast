"""
This app package contains all the code written for pyCast
(ShakeCast V4).

How to start the application after pulling from source:
    1. start the server
        Navigate to shakecast_v4/sc/app/
        $ python server.py
    2. start the CLI
        Navigate to shakecast_v4/sc/
        $ python ui.py
    3. start USGS monitor (geo_json) and shakemap monitor (check_new_shakemaps)
        From within the CLI:
            ShakeCast> start
    4. upload user data:
        (API under construction and *not ready for use*)
        From within the CLI:
            ShakeCast> import_facility_xml /full/path/to/facility_file.xml
            ShakeCast> import_group_xml /full/path/to/group_file.xml
            ShakeCast> import_user_xml /full/path/to/user_file.xml
"""
