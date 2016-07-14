@echo off
net start mysql
net start apache2.2
net start sc_polld
net start sc_dispd
net start sc_notifyqueue
net start sc_notify
net start sc_rssd
net start sc_watcherd

