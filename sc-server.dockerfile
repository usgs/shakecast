FROM usgs/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

RUN curl https://bootstrap.pypa.io/get-pip.py | python
RUN pip install -r requirements.txt

RUN mkdir sc/backups
RUN cp -r sc/templates sc/backups/

ENV SC_DOCKER 1


ENTRYPOINT ["python", "sc/app/server.py", "start"]
