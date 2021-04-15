ARG FROM_IMAGE=usgs/obspy:3.8
ARG APP_SERVER=true

FROM ${FROM_IMAGE}

ENV GOSU_VERSION=1.11
RUN gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
    && curl -o /usr/local/bin/gosu -SL "https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-amd64" \
    && curl -o /usr/local/bin/gosu.asc -SL "https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-amd64.asc" \
    && gpg --verify /usr/local/bin/gosu.asc \
    && rm /usr/local/bin/gosu.asc \
    && rm -r /root/.gnupg/ \
    && chmod +x /usr/local/bin/gosu \
    # Verify that the binary works
    && gosu nobody true

WORKDIR /usr/local/shakecast

COPY requirements.txt .

RUN python3 -m pip install -r requirements.txt

COPY shakecast ./shakecast

#RUN mkdir shakecast/backups; \
RUN install -o usgs-user -g usgs-user -d shakecast/backups; \
    cp -r shakecast/templates shakecast/backups/; \
    cp -r shakecast/conf shakecast/backups/; \
    cp -r shakecast/view/assets shakecast/backups/

ENV SHAKECAST_USER_DIRECTORY /usr/local/shakecast/shakecast
ENV SHAKECAST_WEB_PORT 5000
ENV PYTHONUNBUFFERED 1

COPY scripts/test_env.sh .
COPY entrypoint.sh .
COPY admin ./admin

RUN chmod +x entrypoint.sh
RUN chmod +x test_env.sh

ENTRYPOINT ["./entrypoint.sh"]
