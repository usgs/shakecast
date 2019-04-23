FROM shakecast/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

RUN mkdir shakecast/backups; \
    cp -r shakecast/templates shakecast/backups/; \
    cp -r shakecast/conf shakecast/backups/

ENV SC_DOCKER 1
ENV SC_HOME /usr/local/shakecast/shakecast

EXPOSE 1981

RUN chmod +x sc-server.entrypoint.sh
ENTRYPOINT ["./sc-server.entrypoint.sh"]
