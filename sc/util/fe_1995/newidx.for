	program newidx

c	NEWIDX is the first of 3 programs that must be executed to
c	create the files necessary for efficient retrieval of the F-E
c	geographical region numbers and names.  See also programs FEBNDY
c	and MNAMES.

c	Input: file QUADSIDX.ASC
c	Output: file LLINDX.FER

c	File QUADSIDX.ASC is an ASCII file used primarily to transport
c	these geographical data to other computer systems.

c	File LLINDX.FER is used by program FEBNDY to create file
c	LATTIERS.FER. Both LLINDX.FER & LATTIERS.FER are permanent files
c	used to retrieve the geographical region number.

c	QUADSIDX.ASC consists of 52 56-byte records.  Each record
c	contains 7 4-character numbers, each preceded by 4 blanks and
c	right justified with blank fill to the left, i.e. the record
c	format is (7(4x,i4)).

c	There are 13 of these records for each quadrant of the globe,
c	i.e. 91 numbers per quadrant, corresponding to latitude tiers 0
c	to 90 and -0 to -90.  The quadrant order is NE, NW, SE, and SW.

c	These numbers represent the number of longitudinal boundaries
c	used in each tier of latitude.

c	NEWIDX creates a file similar to QUADSIDX.ASC.  However it is a
c	direct access file and numbers representing pointers into file
c	LATTIERS.FER are paired with each longitudinal boundary count.

c	Programmer  -  G.J. Dunphy  -  April 1980.

	implicit none
	integer*2 buf(7), carry, lbcnt, i, recnum, j, lbmax

	open (9, status='old', file='quadsidx.asc',
     1	      access='sequential', form='formatted')
	open (8, file='llindx.fer', status='new',
     1	      access='direct', form='unformatted', recl=1)

	carry = 1
	recnum = 1
	lbmax = 0

	do i = 1, 52
	    read(9, 20, err=6, end=7) buf
 20	    format(7(4x,i4))
	    do j = 1, 7
		lbcnt = buf(j)
		write(8, rec=recnum, err=6) carry, lbcnt
		recnum = recnum + 1
		carry = carry + lbcnt
c		write (*,*) ' carry, buf(j)=', carry, lbcnt
		if (lbcnt .gt. lbmax) lbmax = lbcnt
	    enddo
	enddo
	go to 4
  7	write (*,'(a)') ' unexpected EOF'
	go to 4
  6	write (*,'(a)') ' I/O error occurred'
  4	close (9)
	close (8)
	write (*,30) ' Max. number of lines in a lat. tier=', lbmax
 30	format(a,i3)
	end
