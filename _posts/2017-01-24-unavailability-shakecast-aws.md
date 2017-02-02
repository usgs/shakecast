---
title:  "ShakeCast Unavailable via Amazon Web Services"
published: true
permalink: 2017_shakecast_public_aws.html
summary: "The change to the DOI regarding governance for cloud solutions requires ShakeCast to be moved from the public AWS to under USGS CHS."
tags: [software_update, troubleshooting]
---

The USGS has received approval from the DOI to operate its own Cloud Hosting Solutions (CHS) platform.  The USGS CHS designs and implements Cloud security and other measures necessary to receive this authority.  

As the result, all requests including ShakeCast for Cloud Services must be submitted through the Associate Chief Information Officer (ACIO).
 
We are currently testing the ShakeCast AWS image under USGS CHS and plan to release new images that will include both ShakeCast V3 and V4 (pyCast) onto the same image this Spring. 

The public AWS ShakeCast will be terminated at anytime in February. Users who already checked-out ShakeCast images can continue to use their own instances and to create their own Amazon Machine Image (AMI).  

For prospective ShakeCast users, we recommend to use the [Windows installer](ftp://ftpext.usgs.gov/pub/cr/co/golden/shakecast/ShakeCast_Installer/ShakeCast_V3.14.1_installer.exe) or [standalone Linux image](ftp://ftpext.usgs.gov/pub/cr/co/golden/shakecast/ShakeCast%20Image/) from the ftp site during the transition period.


Contacts: Kuo-wan Lin (Klin@usgs.gov); David Wald (wald@usgs.gov); Daniel Slosky (dslosky@usgs.gov)
