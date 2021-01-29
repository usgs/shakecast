FROM shakecast/centos

COPY --chown=usgs-user:usgs-user . /usr/local/shakecast

WORKDIR /usr/local/shakecast

#RUN mkdir shakecast/backups; \
RUN install -o usgs-user -g usgs-user -d shakecast/backups; \
    cp -r shakecast/templates shakecast/backups/; \
    cp -r shakecast/conf shakecast/backups/; \
    cp -r shakecast/view/assets shakecast/backups/

ENV SC_DOCKER 1
ENV SC_HOME /usr/local/shakecast/shakecast
ENV APP_SERVER false

EXPOSE 5000

RUN chmod +x entrypoint.sh

USER usgs-user
ENTRYPOINT ["./entrypoint.sh"]
