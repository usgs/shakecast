---
title:  "USGS Web Switching from http to Encrypted https"
published: true
permalink: 2017_usgs_https.html
summary: "The upcoming change to the USGS web site had a change date of March 1, 2017 which may change at any time."
tags: [software_update, troubleshooting]
---

There is now a federal mandate to encrypt all web traffic (enforce https).  The deadline for this was December 31, 2016. This upcoming change to the USGS web site had a change date of March 1, 2017 which may change at any time.    


As the result, all current ShakeCast systems need to have its JSON feed parser updated in order to continue receiving earthquake information from the USGS web site. We have release a new version of [Windows installer](ftp://ftpext.usgs.gov/pub/cr/co/golden/shakecast/ShakeCast_Installer/ShakeCast_V3.14.1_installer.exe) that includes the fix, available from the ftp site. Also available from the ftp is a [pre-made ShakeCast system image for CentOS 7 Linux](ftp://ftpext.usgs.gov/pub/cr/co/golden/shakecast/ShakeCast%20Image/)


Due to the scope of affected ShakeCast systems, we have not released a uniform patch update that will work for all revisions.  To update an installation manually, one can issue the following commands using via a terminal prompt:

## CentOS Linux

~~~
cpanm --force LWP::Protocol::https

wget -O /usr/local/shakecast/sc/bin/gs_json.pl https://raw.githubusercontent.com/klin-usgs/ShakeCast_V3/master/sc/bin/gs_json.pl
~~~

## Windows

~~~
cpanm --force LWP::Protocol::https

lwp-download https://raw.githubusercontent.com/klin-usgs/ShakeCast_V3/PC/sc/bin/gs_json.pl c:/shakecast/sc/bin/gs_json.pl
~~~


Contacts: Kuo-wan Lin (Klin@usgs.gov); David Wald (wald@usgs.gov); Daniel Slosky (dslosky@usgs.gov)
