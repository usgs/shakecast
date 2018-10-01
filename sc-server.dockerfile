FROM shakecast/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

RUN mkdir sc/backups; \
    cp -r sc/templates sc/backups/; \
    cp -r sc/conf sc/backups/

ENV SC_DOCKER 1

ENTRYPOINT ["python", "sc/app/server.py", "start"]
