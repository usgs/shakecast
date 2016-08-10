@echo off
net stop sc_watcherd
net stop sc_polld
net stop sc_dispd
net stop sc_notifyqueue
net stop sc_notify
net stop sc_rssd
rem net stop apache2.2
rem net stop mysql
