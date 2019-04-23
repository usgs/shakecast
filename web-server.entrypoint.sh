#!/usr/bin/env bash
# Docker entrypoint for the shakecast server

python -m shakecast.app.startup
python -m shakecast.web_server
