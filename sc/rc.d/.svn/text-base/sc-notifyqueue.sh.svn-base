#!/bin/sh

SC_DIR=/usr/local/sc
PIDFILE=${SC_DIR}/pids/notifyqueue.pid
PERL=/usr/local/sc/sc.bin/perl

case "$1" in
	start)
		$PERL ${SC_DIR}/bin/notifyqueue.pl --pid-file=${PIDFILE} --daemon
		echo -n ' notifyqueue'
		;;
	stop)
		if [ -f ${PIDFILE} ]; then
			/bin/kill `cat ${PIDFILE}` > /dev/null 2>&1 && echo -n ' notifyqueue'
		else
			echo "notifyqueue isn't running"
		fi
		;;
	*)
		echo ""
		echo "Usage: `basename $0` { start | stop }"
		echo ""
		exit 64
		;;
esac
