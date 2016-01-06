+++
date = "2016-01-06T18:17:24+02:00"
draft = false
tags = ["docker", "apache"]
title = "Static sites with Docker"

+++

As any web technologist would know, static site generators are very popular, and hosting options are easy to find. [GitHub pages](https://pages.github.com/) serves [Jekyll](https://jekyllrb.com/) sites with zero setup, or if one of the other generators is a better fit, there is always S3. I of course have picked [Docker](https://www.docker.com/) to be my hammer, so I want to use it to pound in this nail also. In this writeup I will describe my setup, and where I hope to take it next.

<!--more-->

I was inspired partly by [Diogo Mónica](https://twitter.com/diogomonica)'s [DockerCon EU talk about security](https://www.youtube.com/watch?v=blNIreAq6hc), where he demonstrated various ways to lock down containers. It's not that I'm too worried about hackers defacing my meager web presence, but I do like to tinker, so I decided to try to set up a publishing workflow based on Docker. Hosting would not be a problem, since I have a [DigitalOcean](https://digitalocean.com) droplet already.

My currently chosen site generator is [Hugo](http://gohugo.io/). Not for any particularly good reason, just because I have an interest (if not much experience) in Go, and because it's the latest one I've happened to try. The first thing, then, was to create an image that builds my site using Hugo.

## Builder

I base my custom images on [Alpine Linux](https://hub.docker.com/_/alpine/) these days, because the base image is so small, while still generally having all necessary tools either in place or easily installable. As is so often the case, another had gone before me and created [a Hugo image](https://hub.docker.com/r/publysher/hugo), but it was Debian-based. It did give me a template for Hugo installation, and the idea of using the builder as a volume container. I adapted everything for Alpine and Apache, using Alpine's brilliant [virtual package mechanism](https://github.com/gliderlabs/docker-alpine/blob/master/docs/usage.md#virtual-packages) to clean up after installation. I also added Node.js for my frontend tooling.

```
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
ENV HUGO_THEME ilkka.io

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
RUN npm run js && npm run prefixes && hugo -t ${HUGO_THEME} -d ${WEBROOT}
CMD hugo server -b ${HUGO_BASEURL}
```

When run in isolation, the container will serve up the site with Hugo's built-in web server. I don't really use this feature, and in the future I'd like to create a separate development or writing setup, where Hugo serves up content from a mapped volume, and builds drafts too. Another important bit is using curl to download Hugo. An `ADD` directive with a URL requires Docker to download the file on every build, so that it can compare the contents to see if it should invalidate the cache. A `RUN` directive however is just text, and is fulfilled from cache unless, for example, `HUGO_VERSION` has changed and already invalidated the cache, which is exactly what I want.

Since this Dockerfile sits in my blog content repo, it generates images where all the site content is statically baked in. Now I can just chuck it anywhere and have my site up in no time.

## Server

I chose [Apache 2](https://hub.docker.com/_/httpd/) to serve my site, because I originally wanted to build an image that had integrated [Let's Encrypt](https://letsencrypt.org) certificate renewal, which works best with Apache. I didn't quite get there yet, but more about that later. The official image works nicely as a base, on top of which I layered some sed hacks, so that I could [set `ServerName` when running containers](https://hub.docker.com/r/ilkka/httpd/), and so that [SSL was turned on by default](https://hub.docker.com/r/ilkka/httpd-ssl/). Here's the SSL bit, for example:

```
FROM ilkka/httpd
EXPOSE 443

RUN sed -i 's%#\(Include conf/extra/httpd-ssl.conf\)%\1%' conf/httpd.conf \
  && sed -i 's%#\(LoadModule ssl_module modules/mod_ssl.so\)%\1%' conf/httpd.conf \
  && sed -i 's%#\(LoadModule socache_shmcb_module modules/mod_socache_shmcb.so\)%\1%' conf/httpd.conf \
  && sed -i 's%ServerName www.example.com:443%ServerName ${SERVER_NAME}:443%' conf/extra/httpd-ssl.conf
```

The first three `sed` invocations uncomment things that Apache needs to support HTTPS, like loading configuration files and modules. The last line makes the HTTPS config get the value of the `ServerName` directive from the environment; the HTTP equivalent is in `ilkka/httpd`. One thing to note about this image is that the initial Apache process still runs as root, so [the usual caveats apply](https://docs.docker.com/engine/articles/security/).

## Running in production

I've got Docker Hub autobuilds set up for both the Apache image and the static content image, so I don't even have to do a production build of the site content myself. I use this Docker Compose config to pull everything together:

```
---
sitedata:
  image: ilkka/sitedata
  volumes:
    - /usr/local/apache2/htdocs
  read_only: true
  command: "true"
server:
  image: ilkka/httpd-ssl
  ports:
    - "80:80"
    - "443:443"
  drop_cap:
    - ALL
  add_cap:
    - NET_BIND_SERVICE
    - SETUID
    - SETGID
  volumes_from:
    - sitedata:ro
  volumes:
    - ${SSL_CERT_PATH}:/usr/local/apache2/conf/server.crt:ro
    - ${SSL_CERT_KEY_PATH}:/usr/local/apache2/conf/server.key:ro
  environment:
    SERVER_NAME: ilkka.io
  restart: always
```

The static content container declares the Hugo output directory as a volume, which the server container then mounts in read-only mode. I also don't need the Hugo server process, so the content container just runs `true` and exits immediately. The volume remains for the server to use, since volume lifetimes are not tied to containers in any way. The entire content container also runs in read-only mode for good measure.

The server container drops all capabilities it doesn't need, for a bit of extra security while we wait for [user namespaces](https://github.com/docker/docker/blob/master/experimental/userns.md). `CAP_SETUID` and `CAP_SETGID` are required because Apache starts some child processes as the `daemon` user. Finally, the SSL cert and key are mounted into the container, from paths specified as environment variables when `docker-compose up` is run.

## Future

This all works rather splendidly, but there are a few things I wasn't able to solve yet. First, while I'm a happy [Let's Encrypt](https://letsencrypt.org) user, I still do certificate renewal outside Docker. Putting the Let's Encrypt client into the server image should be simple enough, but then there is the problem of when to trigger renewal. Getting a shell in the running server container with `docker exec` is one option, of course, but I'd really rather automate the process. I think my best bet would be to write a custom [entrypoint](https://docs.docker.com/engine/reference/builder/#entrypoint) script that would renew the certificate before running `httpd`, but I haven't gotten around to it yet. This should be doable within Let's Encrypt's *very* generous rate limits.

Another improvement would be to move my dev setup onto Docker too, so that I could use the content image to run Hugo in dev server mode. Unfortunately I mostly work on a Mac though, so then I run afoul of all the usual virtual machines plus volumes -related issues. Hugo, being written in Go, is just a single static binary, so it's not like installing it is even hard, so I'm not really even sure if this is worth the trouble.

All in all, I'm really happy with how the whole thing turned out, since now I have exactly zero bytes of volatile configuration sitting on my server, and I can destroy and recreate it at will to do e.g. a distro upgrade. I hope you got some ideas out of this, now go build something!
