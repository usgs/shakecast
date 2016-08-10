	program mnames

c	MNAMES reads the ASCII file NAMES.ASC sequentially, and writes an
c	identical unformatted direct access file.

c	Each of the 729 records has a length of 32 characters and contains the
c	Flinn-Engdahl geographical region name whose F-E number corresponds to
c	that of its record number.

c	NOTE: number of records changed to 757 by BPresgrave Feb 17, 2000,
c	using the 1995 revision to the F-E code.

c	Input file: NAMES.ASC
c	Output file: NAMES.FER

c	TO MAINTAIN THE 'sedas$fenames' FILE 'names.fer':
c		1)  Edit names.asc, preserving 32 character record length
c		2)  run MNAMES
c		3)  copy names.fer to directory sedas$permfiles:
c		4)  set prot=(S:RWED,O:RWD,G:RW,W:R)

c	Written by G.J. Dunphy  -  April 1983

	character*32 name
	character*5 oflow

	integer*2 regnum

	open (1, access='sequential', form='formatted', status='old',
     1		file='names.asc')
c	note: output record length is 8 longwords or 32 characters
	open (2, access='direct', form='unformatted', recl=8,
     1		status='new', file='names.fer')

	do regnum = 1, 757
	    read (1, '(2a)') name, oflow
	    if (oflow .ne. ' ') then
		write (*,100) ' Region ',regnum,' name too long: ',name
  100		format(/a,i3,2a)
	    endif
	    write (2, rec=regnum) name
	enddo
	close (1)
	close (2)
	end
