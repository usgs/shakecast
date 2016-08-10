#!/bin/sh

S=60

DIR=/usr/local/shakecast/sc

BIN=$DIR/rc.d

  pkill sc-watcher.sh
  $BIN/sc-dispd.sh stop
  $BIN/sc-polld.sh stop
  $BIN/sc-notify.sh stop
  $BIN/sc-notifyqueue.sh stop
  $BIN/sc-rssd.sh stop


