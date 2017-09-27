#!/bin/sh
if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

./stop_shakecast
echo "Waiting..."
sleep 5
./start_shakecast
