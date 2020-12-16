FROM shakecast/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

RUN mkdir shakecast/backups; \
    cp -r shakecast/templates shakecast/backups/; \
    cp -r shakecast/conf shakecast/backups/; \
    cp -r shakecast/view/assets shakecast/backups/

ENV SC_DOCKER 1
ENV SC_HOME /usr/local/shakecast/shakecast
ENV APP_SERVER true

EXPOSE 1981

RUN chmod +x entrypoint.sh
RUN chmod +x test_env.sh

ENTRYPOINT ["./entrypoint.sh"]
