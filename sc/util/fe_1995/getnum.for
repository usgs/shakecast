	subroutine getnum (lat, lon, nbr)

c	GENERAL VERSION OF GETNUM FOR OUTSIDE DISTRIBUTION

c	PROCEDURE IS CALLED BY namnum

c	ARGUMENTS:
c		lat - geographic latitude in decimal degrees
c		lon - geographic longitude in decimal degrees
c		nbr - the Flinn - Engdahl geographical region number

c	FILES ACCESSED:
c			llindx.fer
c			lattiers.fer

c	A GEOGRAPHIC REGION CONTAINS ITS LOWER BOUNDARIES BUT NOT
c	ITS UPPER. (HERE UPPER AND LOWER ARE DEFINED IN TERMS
c	OF THEIR ABSOLUTE VALUES).  THE EQUATOR BELONGS TO THE NORTHERN
c	HEMISPHERE & THE GREENWICH MERIDIAN BELONGS TO THE EASTERN HEMISPHERE IN
c	THIS IMPLEMENTATION.  180.000 DEGREES LONGITUDE IS ASSIGNED TO THE
c	EASTERN HEMISPHERE.

c	COORDINATES ARE TRUNCATED TO WHOLE DEGREES BEFORE DETERMINING
c	NUMBER.

c	Note:  There are a maximum of 35  (37 with 1995 version of F-E code)
c	boundary-number-pairs/tier in file lattiers.fer.  The record length
c	chosen (512 bytes) corresponds to a page size on the VAX/VMS system.
c	Written by G.J. Dunphy

c	Modified August 18, 1997 by BPresgrave to call subroutine getlun
c	to open the next available unit number for the index and tiers files.
c	The logical units are returned in common /feluns/ and should be left
c	unchanged by the calling program.  The main program should close these
c	files on termination.  This change is based on modifications made by
c	Ray Buland in NSN routine gtnum2.

c	Modified May 29, 2002 by B. Presgrave to use 1995 revision of F-E code.
c	(Number of regions changed from 729 to 757; number of boundary records
c	from 5796 to 5958; value  of LASTRC from 46 to 47.)

	integer RECSIZ, RSTMS2, RSPLS1, RSMNS1, RSMNS2, LASTRC
	parameter (RECSIZ = 128)     ! Recordsize in longwords
	parameter (RSTMS2 = 256)     ! Twice RECSIZ
	parameter (RSPLS1 = 129)     ! RECSIZ + 1
	parameter (RSMNS1 = 127)     ! RECSIZ - 1
	parameter (RSMNS2 = 126)     ! RECSIZ - 2
	parameter (LASTRC =  47)     ! (TOTREC / RECSIZ) + 1 (TOTLEN = 5958)

c	BIBLIOGRAPHIC REFERENCES

c		Flinn, E.A. and E.R. Engdahl (1964). A proposed basis for geo-
c			graphical and seismic regionalization, Seismic Data
c			Laboratory Report No. 101, Earth Sciences Division,
c			United Electrodynamics, Inc. Alexandria, Va.

c		Flinn, E.A. and E.R. Engdahl (1965). A proposed basis for geo-
c			graphical and seismic regionalization, Rev. Geophys 3,
c			123 - 149.

c		Flinn, E.A., E.R. Engdahl and A.R. Hill (1974). Seismic and geo-
c			graphical regionalization, BSSA 64, 771 - 992.

c		Young, J.B., B.W. Presgrave, H. Aichele, D.A. Wiens and E.A.
c			Flinn (1996). The Flinn-Engdahl Regionalisation Scheme:
c			The 1995 Revision, PEPI 96, 223 - 297.

	real lat, lon, lng, alat, alon

	integer getlun			! external function
	integer names, llindx, tiers	! unit numbers

	integer begrec, bgtier, endrec, fntier, hit, idx
	integer	ln, lt, nbr, quadon, recnbr, statll, stattr

	integer*2 tieron, nbrbdy, frstrc, scndrc, pair

	dimension frstrc(RSTMS2), scndrc(RSTMS2), pair(1:2,1:RSTMS2)

	common /feluns/ llindx,tiers,names

	equivalence (pair(1,1), frstrc), (pair(1,RSPLS1), scndrc)

	data llindx,tiers,names /3*-1/

	if (llindx .le. 0) then
c	    call getlun to get the next available unit numbers
	    llindx = getlun()

	    if (llindx .le. 0) then
		write (*,'(a)') ' getnum: no LUN available! Stopping.'
		stop 333
	    endif

	    open (unit=llindx, access='direct', form='unformatted',
     1		status='old',file='llindx.fer',mode='read',share='denywr',
     1		recl=1, iostat=statll)

	    if (statll .ne. 0) then
		write (*, 99) ' NAMNUM: GETNUM: err opening LLINDX.FER',
     1		    ' - iostat =', statll
  99		format(/2a,i5)
		stop 334
	    endif
	endif

	if (tiers .le. 0) then
c	    call getlun to get the next available unit numbers
	    tiers = getlun()

	    if (tiers .le. 0) then
		write (*,'(a)') ' getnum: no LUN available! Stopping.'
		stop 433
	    endif

	    open (unit=tiers, access='direct', form='unformatted',
     1		status='old', file='lattiers.fer',mode='read',
     1		share='denywr', recl=RECSIZ, iostat=stattr)

	    if (stattr .ne. 0) then
		write (*, 99) ' NAMNUM: GETNUM: err opening LATTIERS.FER',
     1		    ' - iostat =', stattr
		stop 434
	    endif
	endif

	nbr = 0
	lng = lon
	if (lng .le. -181.0 .or. lng .ge. 181.0) then
	    write (*,'(/a,f10.4)') ' getnum: bad longitude! ', lng
	    return
	else if (lng .le. -180.0) then
c	    allow for a computation near the dateline that rounded into
c	    western hemisphere. also force -180.0 to be +180.0.
c	    lng = lng + 360.0
	    write (*,50) ' getnum: converting ',lon,' ==> ',lng
  50	    format(a,f10.4,a,f10.4)
	else if (lng .gt. 180.0) then
c	    same thing for rounding into eastern hemisphere
	    lng = lng - 360.0
	    write (*,50) ' getnum: converting ',lon,' ==> ',lng
	endif
	alat = abs(lat)
	alon = abs(lng)
	if (alat .gt. 90.001  .or.  alon .gt. 180.001) then
	    write (*,'(/a)') ' getnum: bad latitude or longitude!'
	    return
	endif

c	GET ONSET OF QUADRANT INFO IN llindx.fer
	if (lat .lt. 0.0) then
c	    NOTE: Both +0.0 & -0.0 will belong to the No. Hemisphere
	    if (lng .lt. 0.0) then
		quadon = 274  ! quadrant onset
	    else
		quadon = 183
	    endif
	else
	    if (lng .lt. 0.0) then
		quadon = 92
	    else
		quadon = 1
	    endif
	endif

c	TRUNCATE ABSOLUTE VALUES OF COORDINATES
	lt = aint(alat)
	ln = aint(alon)

c	GET INDEX TO ONSET OF LATITUDE TIER INFO IN lattiers.fer
	recnbr = lt + quadon
c	tieron = tier onset     nbrbdy = number of segments in tier
	read (llindx, rec=recnbr, iostat=statll) tieron, nbrbdy
	if (statll .ne. 0) then
	    write (*,'(2a,i4)') ' getnum: error reading F-E index file',
     1		' - iostat=', statll
	    return
	endif

c	COMPUTE RECORD IN WHICH LATITUDE TIER BEGINS

	begrec = (tieron + RSMNS1)/RECSIZ

c	COMPUTE RECORD IN WHICH LATITUDE TIER ENDS

	endrec = (tieron + nbrbdy + RSMNS2)/RECSIZ

c	COMPUTE BEGINNING AND ENDING OFFSETS, IN RECORD(S) TO BE READ,
c	OF TARGET LATITUDE TIER.

	bgtier = tieron - (RECSIZ * (begrec - 1))
	fntier = bgtier + nbrbdy - 1

c	READ RECORD IN WHICH LATITUDE TIER BEGINS.
	read (tiers, rec=begrec, iostat=stattr) frstrc
	if (stattr .ne. 0) then
c	    RECORD NO. LASTRC IS THE LAST RECORD IN FILE 'lattiers.fer'
c	    AND IS A SHORT RECORD.
	    if (.not.(stattr.lt.0 .and. begrec.eq.LASTRC)) then
		write (*,'(/a)') ' getnum: error reading frstrc.'
		return
	    endif
	endif
	if (begrec .ne. endrec) then
c	    READ RECORD IN WHICH LATITUDE TIER ENDS, IF NOT ABOVE.
	    read (tiers, rec=endrec, iostat=stattr) scndrc
	    if (stattr .ne. 0) then
		if (.not.(stattr.lt.0.and.endrec.eq.LASTRC)) then
		    write (*,'(/a)') ' getnum: error reading scndrc.'
		    return
		endif
	    endif
	endif

c	TEST LONGITUDE BOUNDARIES
	do idx = bgtier, fntier
	    hit = idx
	    if (pair(1,hit) .gt. ln) then
		hit = hit - 1
		go to 10
	    endif
	enddo

c	OUTPUT F.E. NUMBER
 10	nbr = pair(2,hit)
c	write (*,*) 'getnum: region number is',nbr

	return
	end
