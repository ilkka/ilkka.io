+++
title = "QML woes"
date = "2010-11-28T20:55:54+02:00"
tags = ["qt", "qml", "coding"]
draft = false
+++

I've been experimenting with [Qt
Components](http://qt.gitorious.org/qt-components) recently, even though they
are very much in a pre-alpha state. I think that QML together with the
excellent PySide bindings holds great promise as a crossplatform environment
for mobile app development, even more so than Qt + QML, since there's no need
to set up toolchains for compilation and linking. I'm hoping to write many
apps in this manner, implementing ideas that I've had banging around in my
head for a while now.

I've been building the "mx" or Maemo flavor of Qt Components myself from the
Git repo, but a couple of days ago I came across blog posts by [Attila
Csipa](http://qt-funk.blogspot.com/2010/10/fresh-from-oven-qt-extras-for-ubuntu.html)
and [Kate
Alhola](http://blogs.forum.nokia.com/blog/kate-alholas-forum-nokia-blog/2010/11/14/how-to-make-modern-mobile-applications-with-qt-quick-components)
where I read to my great exitement that there's a PPA with binary packages of
Qt Components for Ubuntu, and that Fremantle packages are available in extras.
This is the ideal combo for me, since I do my development on Ubuntu machines
and my current target would be my N900 running Fremantle.

Excitement soon turned to disappointment, however, when I noticed that the
[binaries for Maverick are failing to
build](https://launchpad.net/~forumnokia/+archive/fn-ppa/+packages). The
problem seems to be that Qt Components wants to `#include <mclassfactory.h>`,
but `libmeegotouch-dev` doesn't publish `mclassfactory.h` as a public header,
instead treating it as a private one. I downloaded the source packages for
both, made `mclassfactory.h` public and rebuilt `libmeegotouch` and
`qt-components` in their entirety.

So far I've only had a chance to do some very preliminary tests on the
desktop, but it looks promising: things seem to work pretty much as expected,
and making QML UIs is not just drawing lines and aligning textboxes anymore.

On the N900 I fared a little worse though: I installed `qt-components-dev`,
quickly typed a QML file that just had a single `com.meego.Window` element in
it and gave it to `qt4-qmlviewer` to show, and it managed to display a window
where the top 1/3 was red and the rest black. Better than nothing, I guess.

So, it seems like my ideal mobile development environment has a ways to go,
then. I'll have to see what the state of the art *really* is on the N900 after
I get something working on the desktop. It's also a bit of a bother that I
can't install `qt-components` in Scratchbox. It'd be nice to not have to copy
stuff to the N900 every time I want to try out something. Maybe I'll have to
solve that through some remote directory mounting over USB-net, then.
