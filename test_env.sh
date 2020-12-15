export TESTING_APP_ENV='testing'
export SC_CI=1 
export SC_SMTP_FROM='shakecast.ci@github.com' 
export SC_SMTP_PORT=1025 
export SC_SMTP_SERVER='localhost'

python -m shakecast.tests.smtpserver &
python get-pip.py --trusted-host pypi.org --trusted-host files.pythonhosted.org
pip install codecov --trusted-host pypi.org --trusted-host files.pythonhosted.org