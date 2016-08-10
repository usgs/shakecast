c	program to test namnum and gtsnum
	program ggeog

	character*32 name
        character*1 ans
	integer number, seinum

	real ltd, lnd

1	if (.true.) then
 	    write (6, '(a)') '$Enter latitude (deg): '
	    read (5, *) ltd
	    write (6, '(a)') '$Enter longitude (deg): '
            read (5, *) lnd
	    call namnum (ltd, lnd, name, number)
	    write (6,'(a)') ' F-E Geographic Region name and number:'
	    write (6, '(1x,a32,1x,i3.3)') name, number
	    call gtsnum (number,seinum)
	    write (6,'(a,i2.2)') ' Seismic region number: ', seinum
            write (6, '(1x,a,$)') ' Want more? (y or n):'
            read (5, '(a1)') ans
            if (ans.eq.'Y' .or. ans.eq.'y') goto 1
	endif
	end
