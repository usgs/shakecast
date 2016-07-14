@echo off

set D=..\sc\bin

perl %D%\polld.pl --remove --sname=sc_polld
perl %D%\dispd.pl --remove --sname=sc_dispd
perl %D%\notifyqueue.pl --remove --sname=sc_notifyqueue
perl %D%\notify.pl --remove --sname=sc_notify
perl %D%\rssd.pl --remove --sname=sc_rssd
