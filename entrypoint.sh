#!/usr/bin/env bash
# Docker entrypoint for the shakecast server

APP_SERVER=${APP_SERVER:-true}

python3 -m shakecast.app.startup

if [ "${APP_SERVER}" = "true" ];
then
  exec python3 -m shakecast.app.server start;
else
  exec python3 -m shakecast.api;
fi
