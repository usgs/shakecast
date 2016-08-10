    PROGRAM PACKAGE FOR FLINN-ENGDAHL SEISMIC AND GEOGRAPHIC REGIONALIZATION

This directory contains all the programs and files needed to establish the
Flinn-Engdahl seismic and geographic regionalization databases (1995 revision)
on a system as well as some subroutines to access the databases.  All programs
are written in Fortran.
Any questions about this package should be directed to Bruce Presgrave
(e-mail: caracara@neisb.cr.usgs.gov).

Programs used to establish the F-E database on a system:
	1. newidx.for		(This program should be run first)
	2. febndy.for
	3. mnames.for
	4. chrecl.for
	5. mksrtb.for

Applications subprograms (used to access database once it has been installed):
	1. namnum.for
	2. getnam.for
	3. getnum.for
	4. gtsnum.for
	5. getlun.for

Test program (driver to test subroutine namnum):
	1. ggeog.for

ASCII files used to transfer and reconstruct the F-E database:
	1. quadsidx.asc
	2. nesect.asc
	3. nwsect.asc
	4. sesect.asc
	5. swsect.asc
	6. names.asc
	7. seisrdef.asc

ASCII files of lat-lon pairs for F-E region boundaries (for plotting):
	1. srbound.asc    - for the 50 seismic regions
	2. febound.asc    - for the 757 geographic regions

*****
NOTE ON PERL VERSION:
*****
Date: Fri, 10 Jan 2003 10:27:26 -0800
To: John Lahr <lahr@gldmutt.cr.usgs.gov>, caracara@neisb.cr.usgs.gov
From: Robert W Simpson <simpson@usgs.gov>
Subject: perl version of Flynn-Engdahl

Hi Bruce and John,

For what it's worth, I wrote a perl version of the feregion program 
that lets you enter a lon,lat and gives back the region name.  I'm 
sure it uses a lot more memory than the fortran version, but I don't 
think it would unduly tax most modern machines (and it's only 145 
lines long including comments and blank lines!).

To run, feregion.pl  (attached to this message) requires the .asc 
files found in  ftp://ghtftp.cr.usgs.gov/pub/feregion/

This script has not been thoroughly tested, so use at your own risk!

Bob.
