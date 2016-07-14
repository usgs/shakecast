	subroutine gtsnum (nbr, snum)

c	Returns the Seismic Region Number

c	ARGUMENTS:
c		nbr - the Flinn - Engdahl geographical region number (i3)
c		snum - Seismic Region Number (i2)

c	FILES ACCESSED:
c		seisreg.fer

c	The Seismic Region number ranges from 1 to 50

c	Written by G.J. Dunphy

c	Modified Aug 18, 1997 by BPresgrave to call subroutine getlun
c	to open the next available unit number.  The logical unit is returned
c	in common /feluns2/ and should be left unchanged by the calling program.
c	The main program should close this file on termination.

	integer*4 getlun		! external function

	integer ios, nbr, snum, lusreg

	common /feluns2/ lusreg

	data lusreg /-1/

	if (lusreg .le. 0) then
c	    call getlun to get the next available unit number
	    lusreg = getlun()

	    if (lusreg .le. 0) then
		write (*,'(a)') ' gtsnum: no LUN available! Stopping.'
		stop 555
	    endif

	    open (unit=lusreg, access='direct', form='unformatted',
     1		recl=1, mode='read',share='denywr',status='old',
     1		file='seisreg.fer')
	endif

	snum = 0
	if (nbr.eq.0) return
	read (lusreg, rec=nbr, iostat=ios) snum
	if (ios.ne.0) then
	    write (*,'(2a,i4)') ' getsnum: error reading seisreg.fer',
     1		' - iostat =', ios
	    snum = 0
	endif

	return
	end
