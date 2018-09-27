FROM usgs/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

RUN curl https://bootstrap.pypa.io/get-pip.py | python;pip install -r requirements.txt

EXPOSE 5000

ENTRYPOINT ["python", "sc/web_server.py"]
