FROM shakecast/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

RUN mkdir shakecast/backups; \
    cp -r shakecast/templates shakecast/backups/; \
    cp -r shakecast/conf shakecast/backups/; \
    cp -r shakecast/view/assets shakecast/backups/

ENV SC_DOCKER 1
ENV SC_HOME /usr/local/shakecast/shakecast
ENV APP_SERVER false

EXPOSE 5000

RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
