# check if shakecast is already present
if [ ! -d /usr/local/shakecast ]
then
# download shakecast
sudo git clone https://github.com/usgs/shakecast.git /usr/local/shakecast
sudo chown -R $USER:$USER /usr/local/shakecast

# start shakecast
DOCKER_UID=$UID DOCKER_GID=$GID docker-compose -f /usr/local/shakecast/docker-compose.yml up -d

# make directory a sandbox so docker can acccess (SELinux sidestep)
sudo chcon -Rt svirt_sandbox_file_t ~/pycast
sudo chown -R $USER:$USER ~/pycast

# reboot machine
echo Rebooting...
sudo reboot
fi
