#!/bin/sh

DIR=/usr/local/shakecast/sc

BIN=$DIR/rc.d

NEWCD="/tmp"

UMASK=077

cd $NEWCD

umask $UMASK

trap "" 1 2 3 6

exec </dev/null >/dev/null 2>/dev/null
#exec <&- >&- 2>&-

$BIN/sc-watcher.sh &

exit 0

#####

