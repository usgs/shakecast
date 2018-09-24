FROM usgs/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

RUN curl https://bootstrap.pypa.io/get-pip.py | python;pip install -r requirements.txt;mkdir sc/backups;cp -r sc/templates sc/backups/

ENV SC_DOCKER 1

ENTRYPOINT ["python", "sc/app/server.py", "start"]
