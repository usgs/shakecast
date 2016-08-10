@echo off

set D=..\sc\bin

perl %D%\polld.pl --install --sname=sc_polld
perl %D%\dispd.pl --install --sname=sc_dispd
perl %D%\notifyqueue.pl --install --sname=sc_notifyqueue
perl %D%\notify.pl --install --sname=sc_notify
perl %D%\rssd.pl --install --sname=sc_rssd
