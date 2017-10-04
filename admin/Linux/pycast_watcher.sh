#!/bin/sh

S=60
script_dir=$(dirname "$0")

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
    sudo $script_dir/start_shakecast.sh
    sleep 2
}

logger "Start pyCast watcher"

sleep_count=0
while true; do
    if [ sleep_count -gt $s ]
    then
        procs=$(getRunningProcs)
        (echo $procs | grep -q python\ server_service.py) || start
        (echo $procs | grep -q python\ web_server_service.py) || start
        sleep_count=0
    else
        ((sleep_count=sleep_count+5))
    fi

    sleep 5
done


