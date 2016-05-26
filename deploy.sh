#!/bin/bash
BASEDIR=$(cd -P $(dirname $0); pwd)
cd $BASEDIR

CTR=ilkka-dot-io

# build site content locally
env DOCKER_HOST= DOCKER_TLS_VERIFY= docker run --rm -v $BASEDIR:/site:rw -w /site node:6 npm install
env DOCKER_HOST= DOCKER_TLS_VERIFY= docker run --rm -v $BASEDIR:/site:rw -w /site node:6 npm run js
env DOCKER_HOST= DOCKER_TLS_VERIFY= docker build -t hugo -f hugo.dockerfile .
env DOCKER_HOST= DOCKER_TLS_VERIFY= docker run --rm -v $BASEDIR:/site:rw -w /site hugo

# build server image and deploy
docker build -t ilkkaio-sitedata .
if docker inspect --type container -f '{{ .State.Running }}' $CTR &>/dev/null;
then
  docker stop $CTR
  docker rm $CTR
fi
docker run -d -e VIRTUAL_HOST=ilkka.io --name $CTR --restart always ilkkaio-sitedata
docker restart caddy-proxy
