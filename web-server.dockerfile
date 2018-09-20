FROM usgs/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

RUN curl https://bootstrap.pypa.io/get-pip.py | python
RUN pip install -r requirements.txt

EXPOSE 80

ENTRYPOINT ["python", "sc/web_server.py"]
