#!/bin/sh
if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

script_dir=$(dirname "$0")
cd $script_dir

./stop_shakecast.sh
echo "Waiting..."
sleep 5
./start_shakecast.sh
