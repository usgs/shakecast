	program febndy

c	FEBNDY is the second of three programs that must be executed to
c	create the files necessary for efficient retrieval of the F-E
c	geographical regions numbers and names.  Program NEWIDX must be
c	executed before running FEBNDY.

c	Input files:
c		LLINDX.FER
c		NESECT.ASC
c		NWSECT.ASC
c		SESECT.ASC
c		SWSECT.ASC
c	Output file:
c		LATTIERS.FER

c	The four *.ASC files, representing each quadrant of the globe, are
c	ASCII files to transport these data to other computer systems.

c	These four files each consist of records of up to 80 bytes.  Each
c	record contains up to 10 pairs of 4-character numbers, right justified
c	with blank fill to left, i.e. the record format is (20i4).

c	These paired numbers represent, respectively, the included longitudinal
c	boundary and its region number.  Each record contains only those
c	ordered pairs pertaining to the same tier of latitude.  Thus short
c	records are used to complete a tier when necessary.

c	FEBNDY converts these 4 quadrant files into 1 direct access file.
c	File LLINDX contains pointers to the onset of each tier, paired with
c	the count of boundary-FE number pairs of that tier.

c	PROGRAMMER: G. J. Dunphy - April 1980

c	NOTE: buf must be dimensioned to be twice the value of lbmax from
c	program NEWIDX.

	character*10 sect, fmt

	integer*2 quad, j, k, m, recnum, size, buf, onset,
     1		fulrec, intlft, kk, kkk, n, beg, fin

	dimension buf(37*2), beg(4), fin(4)

	data beg /1, 92, 183, 274/
	data fin /91, 182, 273, 364/

	open (7, status='old', file='llindx.fer', access='direct',
     1	      form='unformatted', recl=1)

	open (8, status='new', file='lattiers.fer', access='direct',
     1	      form='unformatted', recl=1)

	recnum = 0

	do quad = 1, 4
	    if (quad.eq.1) then
		sect = 'nesect.asc'
	    else if (quad.eq.2) then
		sect = 'nwsect.asc'
	    else if (quad.eq.3) then
		sect = 'sesect.asc'
	    else
		sect = 'swsect.asc'
	    end if
	    write (*,'(2a)') ' Reading file ', sect
	    open (quad, status='old', file=sect, access='sequential',
     1		   form='formatted')

	    do j = beg(quad), fin(quad)
		read (7, rec=j, err=4) onset, size
		fulrec = size / 10
		kk = 0
		kkk = 0
		if (fulrec.gt.0) then
		    do n = 1, fulrec
			kk = (n-1) * 20 + 1
			kkk = n * 20
			read (quad,'(20i4)',end=5) (buf(k), k = kk, kkk)
		    enddo
		end if

		intlft = mod(size,10) * 2
		if (intlft.gt.0) then
		    kk = kkk + 1
		    kkk = kkk + intlft
		    write (fmt, '(''('',i2,''i4)'')') intlft
c		write (*, '(3i6,a10)') intlft, kk, kkk, fmt
		    read (quad, fmt, end=5) (buf(k), k = kk, kkk)
		end if

		do m = 1, size * 2, 2
		    recnum = recnum + 1
		    write(8, rec=recnum, err=6) buf(m), buf(m+1)
		enddo
	    enddo		! end of do loop for j
	    close (quad)
	enddo			! end of main do loop

	goto 7
  4	write (*, '(a)') ' err 7'
	goto 7
  5	write(*, '(a,5i6)') ' end', j, n, fulrec, kk, kkk
	goto 7
  6	write (*, '(a)') ' err 8'
  7	close (7)
	close (8)
	write (*,'(a,i4)') ' Total number of records written=',recnum
	end
