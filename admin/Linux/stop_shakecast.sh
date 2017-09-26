#!/bin/sh
if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

# stop the watcher daemon
echo "Stopping pyCast Watcher..."
PIDFILE=$(pwd)/pycast_watcher.pid
PID=$(cat $PIDFILE)
kill $PID

echo "Stopping pycast..."

python web_server_service.py stop
python server_service.py stop

echo "Done."