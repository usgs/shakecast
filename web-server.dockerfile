FROM shakecast/centos

COPY . /usr/local/shakecast

WORKDIR /usr/local/shakecast

EXPOSE 5000

ENTRYPOINT ["python", "-m", "shakecast.web_server"]
