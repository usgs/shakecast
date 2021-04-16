#!/usr/bin/env bash

python3 -m pip install codecov --trusted-host pypi.org --trusted-host files.pythonhosted.org

python3 -m smtpd -n -c DebuggingServer localhost:${SHAKECAST_SMTP_PORT} &
python3 -m shakecast.app.startup
