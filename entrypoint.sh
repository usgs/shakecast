#!/usr/bin/env bash
# Docker entrypoint for the shakecast server

APP_SERVER=${APP_SERVER:-true}

python -m shakecast.app.startup

if [ "${APP_SERVER}" = "true" ];
then
  exec python -m shakecast.app.server start;
else
  exec python -m shakecast.api;
fi
