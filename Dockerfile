ARG FROM_IMAGE=usgs/python
ARG APP_SERVER=true

FROM ${FROM_IMAGE}

WORKDIR /usr/local/shakecast

COPY --chown=usgs-user:usgs-user requirements.txt .

RUN python3 -m pip install -r requirements.txt

COPY --chown=usgs-user:usgs-user shakecast ./shakecast

#RUN mkdir shakecast/backups; \
RUN install -o usgs-user -g usgs-user -d shakecast/backups; \
    cp -r shakecast/templates shakecast/backups/; \
    cp -r shakecast/conf shakecast/backups/; \
    cp -r shakecast/view/assets shakecast/backups/

ENV SC_HOME /usr/local/shakecast/shakecast
ENV SHAKECAST_WEB_PORT 5000
ENV PYTHONUNBUFFERED 1

COPY --chown=usgs-user:usgs-user scripts/test_env.sh .
COPY --chown=usgs-user:usgs-user entrypoint.sh .
COPY --chown=usgs-user:usgs-user admin ./admin

RUN chmod +x entrypoint.sh
RUN chmod +x test_env.sh
USER usgs-user
ENTRYPOINT ["./entrypoint.sh"]
