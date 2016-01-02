FROM httpd
MAINTAINER Ilkka Laukkanen <ilkka@ilkka.io>

RUN sed -i 's%#\(Include conf/extra/httpd-ssl.conf\)%\1%' conf/httpd.conf \
  && sed -i 's%#\(LoadModule ssl_module modules/mod_ssl.so\)%\1%' conf/httpd.conf \
  && sed -i 's%#\(LoadModule socache_shmcb_module modules/mod_socache_shmcb.so\)%\1%' conf/httpd.conf \
  && sed -i 's%#ServerName www.example.com:80%ServerName ilkka.io:80%' conf/httpd.conf \
  && sed -i 's%ServerName www.example.com:443%ServerName ilkka.io:443%' conf/extra/httpd-ssl.conf
