#!/bin/sh

S=60

DIR=/usr/local/sc

BIN=$DIR/rc.d

process() {
    ps axww | grep -v grep | grep '\--daemon' | 
      sed -e "s/^.*\/sc\/bin\/\([a-z][a-z]*\.pl\).*/\1/"
}

start() {
    logger "sc-watcher starting $1"
    $BIN/sc-$1.sh start
    sleep 2
}

logger "begin sc-watcher"

while true; do
  procs=`process`
#  logger "sc-watcher =$procs="
  (echo $procs | grep -q dispd.pl) || start dispd
  (echo $procs | grep -q polld.pl) || start polld
  (echo $procs | grep -q notify.pl) || start notify
  (echo $procs | grep -q notifyqueue.pl) || start notifyqueue
  (echo $procs | grep -q rssd.pl) || start rssd
  sleep $S
done


