	subroutine namnum (geoltd, geolnd, name, number)

c	Given the geographical coordinates in decimal degrees, returns
c	the Flinn - Engdahl geographical region number (I3) and
c	name (character*32).

c	entry point NAMNBR accepts coordinates in radians.

c	ARGUMENTS:
c		1.  geographical latitude in degrees (geoltd)  -   real
c		2.  geographical longitude in degrees (geolnd)  -  real
c		3.  geographical region name			-  character*32
c		4.  F-E geographical region number		-  integer

c	Note:  Getnum and getnam call getlun to get the next available
c	       unit number, returning them in common /feluns/. The calling
c	       program should close these files on termination.

c	Original program written by G.J. Dunphy, with modifications by B.
c	Presgrave (29 Aug 1991 and 18 Aug 1997).

	integer number

	real deg, geoltd, geolnd, geoltr, geolnr

	character*32 name

	data deg /57.2957795/

	call getnum (geoltd, geolnd, number)
	call getnam (number, name)

	return

c	************
	entry namnbr (geoltr, geolnr, name, number)
c	************

	call getnum (geoltr*deg, geolnr*deg, number)
	call getnam (number, name)

	return
	end
