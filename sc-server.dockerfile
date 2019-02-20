FROM shakecast/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

RUN mkdir shakecast/backups; \
    cp -r shakecast/templates shakecast/backups/; \
    cp -r shakecast/conf shakecast/backups/

ENV SC_DOCKER 1

EXPOSE 1981

ENTRYPOINT ["python", "-m", "shakecast.app.server", "start"]
