.. pyCast documentation master file, created by
   sphinx-quickstart on Mon Jan 25 15:14:13 2016.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

###############################################
Starting ShakeCast
###############################################

Install Python 2.7x

Download and run get pip:
    1. curl `https://bootstrap.pypa.io/get-pip.py <https://bootstrap.pypa.io/get-pip.py>`_ > get-pip.py
    2. python get-pip.py

Clone the repository from GitHub:
    1. git clone `https://github.com/usgs/shakecast.git <https://github.com/usgs/shakecast.git>`_

Install the requirements:
    1. cd shakecast
    2. Open a virtual environment if you wish (instructions to come `http://docs.python-guide.org/en/latest/dev/virtualenvs/ <http://docs.python-guide.org/en/latest/dev/virtualenvs/>`_)
    3. pip install -r requirements.txt

ShakeCast is comprised of a ShakeCast server and a web server. The ShakeCast server scans for earthquake data, performs calculations, and sends notifications, while the web server provides a user interface for the software. These servers are started from individual python files; a setup script should run these files as daemons/services, but this has not been implemented yet.

Start the ShakeCast server:
    1. cd sc/app
    2. python server.py start

Start the web server:
    1. cd ../
    2. Start the web server 
        a. sudo python web_server.py (run web server in production from port 80)
        b. python web_server.py -d (run web server in development mode on port 5000)