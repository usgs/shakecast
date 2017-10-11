#!/bin/sh
if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

script_dir=$(dirname "$0")
cd $script_dir

# stop the watcher daemon
echo "Stopping pyCast Watcher..."
PIDFILE=$(pwd)/pycast_watcher.pid
PID=$(cat $PIDFILE)
kill $PID
sleep 2
echo "Done."

echo "Stopping pyCast..."

python $(pwd)/web_server_service.py stop
python $(pwd)/server_service.py stop

echo "Done."