	subroutine getnam (nbr, name)

c	GENERAL VERSION OF GETNAM FOR OUTSIDE DISTRIBUTION

c	PROCEDURE IS CALLED BY namnum

c	ARGUMENTS:
c		nbr - the Flinn - Engdahl geographical region number
c		name - the corresponding F-E geographical region name

c	FILES ACCESSED:
c		names.fer

c	A GEOGRAPHICAL REGION NAME IS NO MORE THAN 32 CHARACTERS IN LENGTH.

c	Written by G.J. Dunphy

c	modified August 18, 1997 by BPresgrave to call subroutine getlun
c	to open the next available unit number. The logical unit is returned
c	in common /feluns/ and should be left unchanged by the calling program.
c	The main program should close this file on termination.  This change
c	is based on modifications made by Ray Buland in NSN routine gtnam2.

	integer nbr, statna
	integer names, llindx, tiers	! unit numbers
	integer getlun			! external function

	character*32 name, blank

	common /feluns/ llindx,tiers,names

	data blank /' '/

	if (names .le. 0) then
	    names = getlun()	! get the next available unit number

	    if (names .le. 0) then
		write (*,'(a)') ' getnam: no LUN available! Stopping.'
		stop 222
	    endif

	    open (unit=names,access='direct',form='unformatted',recl=8,
     1		mode='read',share='denywr',status='old',file='names.fer')
	endif
	name = blank
	if (nbr.eq.0) return
	read (names, rec=nbr, iostat=statna) name
	if (statna.ne.0) name = blank
	return
	end
