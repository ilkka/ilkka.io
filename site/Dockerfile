FROM alpine:3.3
MAINTAINER Ilkka Laukkanen <ilkka@ilkka.io>

# inspired by https://hub.docker.com/r/publysher/hugo but alpine-based
# and tuned for my own usecase.

RUN apk --no-cache add python nodejs \
  && apk --no-cache add --virtual build-dependencies python-dev py-pip build-base curl \
  && pip install pygments

ENV HUGO_VERSION 0.15
ENV HUGO_BINARY hugo_${HUGO_VERSION}_linux_amd64
ENV WEBROOT /usr/local/apache2/htdocs
ENV HUGO_BASEURL http://localhost:1313

RUN mkdir /site
WORKDIR /site

ADD package.json /site/
RUN npm install

# curl instead of ADD so we use the cache
RUN curl -L https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/${HUGO_BINARY}.tar.gz > /usr/local/${HUGO_BINARY}.tar.gz \
  && tar xzf /usr/local/${HUGO_BINARY}.tar.gz -C /usr/local/ \
  && ln -s /usr/local/${HUGO_BINARY}/${HUGO_BINARY} /usr/local/bin/hugo \
  && rm /usr/local/${HUGO_BINARY}.tar.gz

# remove the metapackage we created earlier
RUN apk del build-dependencies

# for if we run hugo server, as is the default cmd
EXPOSE 1313

ADD . /site
RUN hugo -d ${WEBROOT}
CMD hugo server -b ${HUGO_BASEURL}
