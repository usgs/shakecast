#!/usr/bin/env bash
# Docker entrypoint for the shakecast server

APP_SERVER=${APP_SERVER:-true}
USER_ID=${LOCAL_USER_ID:-0}

python3 -m shakecast.app.startup

# Run any arguments directly
if [ $@ ];
then
  exec "$@"

  exit 0;

elif [ "${USER_ID}" -gt 0 ];
then
  # Running shakecast as a local user
  echo "Starting with UID : $USER_ID";

  id -u shakecast &>/dev/null || useradd -u $USER_ID -o shakecast;
  chown -R shakecast:shakecast .;

  if [ "${APP_SERVER}" = "true" ];
  then
    exec /usr/local/bin/gosu shakecast python3 -m shakecast.app.server start;
  else
    exec /usr/local/bin/gosu shakecast python3 -m shakecast.api;
  fi

  exit 0;
fi

# Running shakecast as the root user
echo "
**************************************************************************
Starting as Root, recommend setting SHAKECAST_USER_ID to a local user id

Example:
export SHAKECAST_USER_ID=\${UID}

**************************************************************************
";

if [ "${APP_SERVER}" = "true" ];
then
  exec python3 -m shakecast.app.server start;
else
  exec python3 -m shakecast.api;
fi
