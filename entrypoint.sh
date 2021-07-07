#!/usr/bin/env bash
# Docker entrypoint for the shakecast server

APP_SERVER=${APP_SERVER:-true}
USER_ID=${SHAKECAST_USER_ID:-0}

python3 -m shakecast.app.startup

# Run any arguments directly
if [ $# -gt 0 ];
then
  exec "$@"

  exit 0;

elif [ "${USER_ID}" -gt 0 ];
then
  # Running shakecast as a local user
  echo "Starting with UID : $USER_ID";

  id -u shakecast &>/dev/null || useradd -u $USER_ID -o shakecast;
  chown -R shakecast:shakecast .;

  if [ "${SERVER_TYPE}" = "APP_SERVER" ];
  then
    exec /usr/local/bin/gosu shakecast python3 -m shakecast.app.server start;
  elif [ "${SERVER_TYPE}" = "GROUND_FAIURE" ];
  then
    exec /usr/local/bin/gosu shakecast python3 -m shakecast.app.groundfailure;
  elif [ "${SERVER_TYPE}" = "WEB_SERVER" ];
  then
    exec /usr/local/bin/gosu shakecast python3 -m shakecast.api;
  elif [ "${SERVER_TYPE}" = "ORIGIN" ];
  then
    exec /usr/local/bin/gosu shakecast python3 -m shakecast.app.origin;
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

echo "SERVER TYPE IS: ${SERVER_TYPE}"
if [ "${SERVER_TYPE}" = "APP_SERVER" ];
then
  exec python3 -m shakecast.app.server start;
elif [ "${SERVER_TYPE}" = "GROUND_FAILURE" ];
then
  exec python3 -m shakecast.app.groundfailure;
elif [ "${SERVER_TYPE}" = "WEB_SERVER" ];
then
  exec python3 -m shakecast.api;
elif [ "${SERVER_TYPE}" = "ORIGIN" ];
then
  exec python3 -m shakecast.app.origin;
fi
