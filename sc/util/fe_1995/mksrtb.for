	program mksrtb

c	Given file SEISRDEF.ASC as input, MKSRTB creates file SEISREG.FER
c	as a fixed length record, direct access file. Subroutine GTSEIS, given
c	a geographical region number, can then use this file to obtain
c	the seismic region number.

	integer*4 b, e
	integer*4 i, j, k

	open (1, access='sequential', form='formatted',status='old',
     1		file='seisrdef.asc')
	open (2, access='direct', form='unformatted', status='new',
     1		file='seisreg.fer', recordtype='fixed', recl=1)
	do i = 1, 50
	    read (1, '(i2,2(1x,i3))', iostat=ios) j, b, e
	    if (ios .ne. 0 .or. i .ne. j) go to 10
	    if (b .eq. 0) go to 10
	    if (e .eq. 0) then
		write (2, rec=b) i
	    else
		do k = b, e
	            write (2, rec=k) i
		enddo
	    endif
	enddo
	close (1)
	close (2)
	write (*,'(a)') ' New file seisreg.fer created.'
	stop
  10	write (*,'(/a)') ' Error reading seisrdef.asc!!'
	write (*,*) ' j, b, e=',j,b,e
	close (1)
	close (2, status='delete')
	end
