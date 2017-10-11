#!/bin/sh
if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

script_dir=$(dirname "$0")
cd $script_dir

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
    sudo $(pwd)/start_shakecast.sh
    sleep 2
}

logger "Start pyCast watcher"

sleep_count=65
while true; do
    if [ $sleep_count -gt $S ]
    then
        procs=$(getRunningProcs)
        (echo $procs | grep -q python\ $(pwd)/server_service.py) || start
        (echo $procs | grep -q python\ $(pwd)/web_server_service.py) || start
        sleep_count=0
    else
        ((sleep_count=sleep_count+5))
    fi

    sleep 5
done