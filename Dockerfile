FROM nginx:1.11-alpine
MAINTAINER Ilkka Laukkanen <ilkka@ilkka.io>

ADD public/ /usr/share/nginx/html/
