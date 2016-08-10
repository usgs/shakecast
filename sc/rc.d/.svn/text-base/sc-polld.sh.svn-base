#!/bin/sh

SC_DIR=/usr/local/sc
PIDFILE=${SC_DIR}/pids/polld.pid
PERL=/usr/local/sc/sc.bin/perl

case "$1" in
	start)
		$PERL ${SC_DIR}/bin/polld.pl --pid-file=${PIDFILE} --daemon
		echo -n ' polld'
		;;
	stop)
		if [ -f ${PIDFILE} ]; then
			/bin/kill `cat ${PIDFILE}` > /dev/null 2>&1 && echo -n ' polld'
		else
			echo "polld isn't running"
		fi
		;;
	*)
		echo ""
		echo "Usage: `basename $0` { start | stop }"
		echo ""
		exit 64
		;;
esac
