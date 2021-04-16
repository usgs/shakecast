#!/usr/bin/env bash

python3 -m pip install codecov --trusted-host pypi.org --trusted-host files.pythonhosted.org

python3 -m shakecast.tests.smtpserver &
python3 -m shakecast.app.startup
