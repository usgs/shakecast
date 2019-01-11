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

# download the startup script
curl -s https://raw.githubusercontent.com/dslosky-usgs/shakecast/docker/admin/Linux/centos/docker-pycast-startup.sh > ~/docker-pycast-startup.sh
sudo chmod +x docker-pycast-startup.sh

# adding startup will start pyCast on reboot
if [[ $1 = '--add-startup' ]]
then
(crontab -l ; echo "@reboot $(pwd)/docker-pycast-startup.sh > ~/pycast-startup.log 2>&1") | sort - | uniq - | crontab -
fi

if [[ $2 = '-r' ]]
then
echo Rebooting...
sudo reboot
fi
