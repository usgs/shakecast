---
title:  "ShakeCast V3 Script Patch for ShakeMap 4"
published: true
permalink: shakemap4_v3_patch.html
summary: "The new USGS ShakeMap V4 does not include the stationlist.xml prdouct file.  It will prevent the current V3 PDF generator from working properly. This patch instruction is crucial for ShakeCast systems with the PDF report attached to notifications."
tags: [software_update, troubleshooting]
---

The new USGS ShakeMap V4 went live in March, 2019.  The transition from ShakeMap V3.5 to V4 is expected to take some time until all seismic networks contributing ShakeMaps have upgraded their application.

While ShakeCast V3 continues to process grid data from either ShakeMap V3.4 or V4, the lack of the stationlist.xml prdouct file for ShakeMap V4 created an unique problem for ShakeCast.  Specifically, it will prevent the current V3 PDF generator from working properly.  

This instruction describes how to apply the PDF script patch to remove the station file dependency. The optional JSON feed parser patch adds ShakeMap V4 specific products to its list for downloads and rename the V4 intensity overlay file to the generic "ii_overlay.png."





## ShakeCast V3 github Repository 
The code repository with the patch can be found [here](https://github.com/klin-usgs/ShakeCast_V3). If you're running your instance operationally, you can download the code patch directly from the command line. We have tested using the "curl" program, which is available on both Linux and Windows 10 server.

```
curl -o /usr/local/shakecast/sc/bin/sc_pdf.pl https://raw.githubusercontent.com/klin-usgs/ShakeCast_V3/master/sc/bin/sc_pdf.pl

curl -o /usr/local/shakecast/sc/bin/gs_json.pl https://raw.githubusercontent.com/klin-usgs/ShakeCast_V3/master/sc/bin/gs_json.pl
```

The same method can also be used to update selected files/templates on the target server.

## User's Local github Repository
For ShakeCast installations using the github repository, you could choose to synchronize your local github repository with the upstream server.  The script patch can be applied selectively using the following methods.

```
git fetch github
git checkout github/master -- /usr/local/shakecast/sc/bin/sc_pdf.pl
git checkout github/master -- /usr/local/shakecast/sc/bin/gs_json.pl
```
