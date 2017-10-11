#!/bin/sh
if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

script_dir=$(dirname "$0")
cd $script_dir

getRunningProcs() {
    # Base list of processes to search for pyCast related daemons
    sudo ps axww | grep -v grep
}

createCron () {
    #Creates a cron job that runs on reboot to restart pyCast
    echo "Installing pyCast watcher..."
    sudo crontab -l > mycron
    echo "@reboot $(pwd)/start_shakecast.sh &" >> mycron
    #install new cron file
    sudo crontab mycron
    rm mycron

    # make sure only admin can altar this cron file
    chmod 700 $(pwd)/start_shakecast.sh
    echo "Done."
}

startWatcher() {
    echo "Starting pyCast Watcher..."
    # start the watcher daemon
    PIDFILE=$(pwd)/pycast_watcher.pid
    $(pwd)/pycast_watcher.sh &
    echo $! > $PIDFILE
    echo "Done."
}

echo "Starting pyCast..."

python $(pwd)/web_server_service.py start &
python $(pwd)/server_service.py start &

echo "Done."

# check to see if cron job is installed already, install it otherwise
(sudo crontab -l | grep -q $(pwd)/start_shakecast.sh) || createCron

# check to see if the watcher is running and run it otherwise
procs=$(getRunningProcs)
(echo $procs | grep -q $(pwd)/pycast_watcher.sh) || startWatcher

exit 0