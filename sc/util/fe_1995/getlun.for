c	 getlun	- get the next available unit number
c  returns an available unit number or returns -1 if no units are available
c  It provides a more generic routine to get the next unit number that the
c  SEDAS/NSN routine gtunit. Modified from gtunit by B. Presgrave Aug 18, 1997.

	integer*4 function getlun ()

	integer unum
	logical inuse

	unum = 0
	inuse = .TRUE.
c   Number of units changed from 20 to 100 for the VAX on
c   15 April 1981 by R. Buland.
	do while (unum .lt. 100 .and. inuse)
	    unum = unum + 1
	    inquire (unum, opened=inuse)
	enddo

	if (inuse) then
	    getlun = -1
	else
	    getlun = unum
	endif

	return
	end
