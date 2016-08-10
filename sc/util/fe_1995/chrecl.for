	program chrecl

c	CHRECL (CHange RECord Length) merely rewrites file LATTIERS.FER at a
c	different record length.  LATTIERS.FER is originally written by FEBNDY
c	with a record length of 1 longword (4 bytes).  However, subroutine
c	GETNUM should read this unformatted, direct access file at a record
c	length optimal to the system upon which it resides.  Some systems,
c	such as the UNIX allow an unformatted, direct access file to be read
c	at a different record length than that at which it was written.
c	Others, such as the VAX/VMS do not.

c	SUBROUTINE GETNUM REQUIRES A RECORD LENGTH OF AT LEAST 34 LONGWORDS
c	(136 bytes), as it is structured so as to use no more than 2 consecutive
c	reads to scan an entire longitude tier (current max. length is 37
c	longwords, given when program NEWIDX terminates successfully).

c	NOTE that the value of TOTREC must agree with the total number of
c	records written by program FEBNDY (currently 5958, and given when
c	program FEBNDY terminates successfully).

c	record length in 16-bit words
	integer*2 RCLLW

c	record length for open statement (as required by system)
c	(currently 128, for 512 byte records)
	integer*2 RCLOP
	integer*2 TOTREC
	integer*4 ios

	parameter (RCLLW = 256, RCLOP = 128, TOTREC = 5958)

	integer*2 buf(RCLLW)
	open (1, access='direct', form='unformatted', status='old',
     1      file='lattiers.fer', recl=1)
	open (2, status='new', file='lattiers.fer', access='direct',
     1      form='unformatted', recl=RCLOP)

	i = 1
	j = 0
	k = 1
	do while (i .le. TOTREC)
	    j = j + 2
	    read (1, rec=i, iostat=ios) buf(j-1), buf(j)
	    if (ios .ne. 0) then
		if (ios .lt. 0) then
		    write(*,'(a,i5)') ' Unexpected EOF at record no. ',i
		else
		    write(*,'(a,i5)') ' Read error at record no. ', i
		endif
		close (2, status='delete')
		go to 10
	    endif
	    if (j .eq. RCLLW) then
		write (2, rec=k) buf
		k = k + 1
		j = 0
	    endif
	    i = i + 1
	end do
	write (2, rec=k) (buf(m), m = 1, j)
	write (*,'(a,i5)') ' Total no. of   4-byte records read=', i
	write (*,'(a,i3,a,i5)') ' Total no. of ',RCLOP*4,
     1		'-byte records written=', k
	close (2)
  10	close (1)
	end
