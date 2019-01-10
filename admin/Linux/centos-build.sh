# install docker, pip, and git
sudo yum update -y
sudo yum install epel-release -y
sudo yum install docker -y
sudo yum install python-pip -y
sudo yum install git -y

# install docker-compose
sudo pip install docker-compose

# enable docker so it starts on boot
sudo systemctl enable docker
sudo service docker start

# create a group so docker can be controlled without sudo
sudo groupadd docker
sudo usermod -aG docker $USER

# download shakecast
git clone https://github.com/usgs/shakecast.git

# start shakecast
DOCKER_UID=$UID DOCKER_GID=$GID docker-compose -f shakecast/docker-compose.yml up -d

# make directory a sandbox so docker can acccess (SELinux sidestep)
sudo chcon -Rt svirt_sandbox_file_t ~/pycast

# reboot machine
echo Rebooting...
sudo reboot