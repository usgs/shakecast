export SHAKECAST_SMTP_FROM='shakecast.ci@github.com'
export SHAKECAST_SMTP_PORT=7654
export SHAKECAST_SMTP_SERVER='localhost'
export SHAKECAST_WEB_PORT=5000

python3 -m pip install codecov --trusted-host pypi.org --trusted-host files.pythonhosted.org

python3 -m shakecast.tests.smtpserver &
python3 -m shakecast.app.startup
