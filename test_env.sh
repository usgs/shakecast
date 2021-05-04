export TESTING_APP_ENV='testing'
export SC_CI=1 
export SC_SMTP_FROM='shakecast.ci@github.com' 
export SC_SMTP_PORT=1025 
export SC_SMTP_SERVER='localhost'

python -m shakecast.tests.smtpserver &
python -m shakecast.app.startup