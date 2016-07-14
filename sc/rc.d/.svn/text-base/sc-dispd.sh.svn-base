#!/bin/sh

SC_DIR=/usr/local/sc
PIDFILE=${SC_DIR}/pids/dispd.pid
PERL=/usr/local/sc/sc.bin/perl

case "$1" in
	start)
		$PERL ${SC_DIR}/bin/dispd.pl --pid-file=${PIDFILE} --daemon
		echo -n ' dispd'
		;;
	stop)
		if [ -f ${PIDFILE} ]; then
			/bin/kill `cat ${PIDFILE}` > /dev/null 2>&1 && echo -n ' dispd'
		else
			echo "dispd isn't running"
		fi
		;;
	*)
		echo ""
		echo "Usage: `basename $0` { start | stop }"
		echo ""
		exit 64
		;;
esac
