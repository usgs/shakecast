FROM shakecast/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

ENV SC_HOME /usr/local/shakecast/shakecast

EXPOSE 5000

ENTRYPOINT ["python", "-m", "shakecast.web_server"]
