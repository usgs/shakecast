---
title:  "ShakeCast Installer for Windows V3.14.3"
published: true
permalink: 2017_shakecast_win_v3.14.3.html
summary: "This installer includes updates that address recent changes to the USGS web site."
tags: [software_update, troubleshooting]
---

The tagged release V3.14.3 applies to both Linux and Windows (installer) environment.  It includes several updates that address networking issues at the USGS web site and difficulties reported by some users when running the application in a restrictive IT setting.    

Specific features/requirements of the update include the following:

- wkhtmltoimage.  It needs to be version 0.12 or later (included as part of the Windows installer).
- Leaflet OSM Javascript library.  The updated screenshot routine now takes place using a web page (screenshot.html) on the local system and does not require a web server.  The mapping engine had also been switched to using Leaflet OSM.
- Default Google Maps API key.  There is a default API key included in this revision.  Please register your own API key, if possible, for production purpose.
- GS JSON parser. The parser had been updated due to the removal of the ShakeMap RSS feed and the legacy ShakeMap archive.  The new GS JSON parser interacts with the Comprehensive Catalog (ComCat) server to retrieve ShakeMap scenarios.
- Intermediate SSL intercept.  The latest revision GS JSON parser added a workaround on SSL intercept to avoid the need for a custom certificate.
- Screen capture routine now will try to fit the mapping boundariess based on the areal extent of the ShakeMap image overlay.
- Minor tweaks to CGI scripts for earlier versions of Windows.


## Linux
The recommended method to receive code update is via github by following the [V3 specific development](https://github.com/klin-usgs/ShakeCast_V3.git).

~~~
https://github.com/klin-usgs/ShakeCast_V3.git
~~~

## Windows
Windows installer (64-bit only) is available from the release tag via the [page](https://github.com/usgs/shakecast/releases/tag/3.14.1)

~~~
https://github.com/usgs/shakecast/releases/tag/3.14.1
~~~


Contacts: Kuo-wan Lin (Klin@usgs.gov); David Wald (wald@usgs.gov); Daniel Slosky (dslosky@usgs.gov)
