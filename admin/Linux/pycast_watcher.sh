#!/bin/sh

S=60

cleanup ()
{
    logger "Stopping pycast watcher."
    exit 0
}

# trap kill signal and run cleanup
trap cleanup SIGINT SIGTERM

getRunningProcs() {
    sudo ps axww | grep -v grep
}

start() {
    logger "pyCast watcher starting ShakeCast"
    sudo ./start_shakecast.sh
    sleep 2
}

logger "Start pyCast watcher"

while true; do
  procs=`getRunningProcs`
  (echo $procs | grep -q server_service.py\ start) || start
  sleep $S
done


