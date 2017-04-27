#!/bin/sh
if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

echo "Starting Shakecast..."

python web_server_service.py start &
python server_service.py start &

echo "Done."