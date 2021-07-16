ARG FROM_IMAGE=usgs/obspy:3.8

FROM ${FROM_IMAGE}

ENV GOSU_VERSION=1.13
RUN curl -o /usr/local/bin/gosu -SL "https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-amd64" \
    && chmod +x /usr/local/bin/gosu \
    # Verify that the binary works
    && gosu nobody true

WORKDIR /usr/local/shakecast

COPY requirements.txt .

RUN python3 -m pip install pymysql
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

COPY scripts ./scripts
COPY environments ./environments
COPY admin ./admin

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

RUN find ./scripts -type f -iname "*.sh" -exec chmod +x {} \;

ENTRYPOINT ["sh", "-c", "./entrypoint.sh"]
