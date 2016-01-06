+++
date = "2016-01-06T18:17:24+02:00"
draft = true
tags = ["docker"]
title = "Static sites with Docker"

+++

As any web technologist would know, static site generators are very popular, and hosting options are easy to find. [GitHub pages](https://pages.github.com/) serves [Jekyll](https://jekyllrb.com/) sites with zero setup, or if one of the other generators is a better fit, there is always S3. I of course have picked [Docker](https://www.docker.com/) to be my hammer, so I want to use it to pound in this nail also. In this writeup I will describe my setup, and where I hope to take it next.

<!--more-->

I was inspired partly by [Diogo Mónica](https://twitter.com/diogomonica)'s [DockerCon EU talk about security](https://www.youtube.com/watch?v=blNIreAq6hc), where he demonstrated various ways to lock down containers. It's not that I'm too worried about hackers defacing my meager web presence, but I do like to tinker, so I decided to try to set up a publishing workflow based on Docker.

My currently chosen site generator is [Hugo](http://gohugo.io/). Not for any particularly good reason, just because I have an interest (if not much experience) in Go, and because it's the latest one I've happened to try. The first thing, then, was to create an image that builds my site using Hugo.

## Builder

- alpine because...
- install the toolchain
- contain the content

## Server

- as little config as possible
- still gotta solve the letsencrypt part
