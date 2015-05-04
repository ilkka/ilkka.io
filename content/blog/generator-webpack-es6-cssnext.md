+++
date = "2015-05-04T07:15:17+03:00"
draft = false
tags = ["node", "software", "web", "yeoman", "webpack", "es6", "css4"]
title = "Webpack + ES6 + CSS next Yeoman generator"

+++

I like ES6. I *really* like [Webpack](http://webpack.github.io). I also quite like future CSS syntax. That's why I wrote [generator-webpack-es6-cssnext](https://github.com/ilkka/generator-webpack-es6-cssnext), a Yeoman generator for starting a project using all of them!

<!--more-->

The generated project gets a very barebones toolchain powered by npm scripts: you can do

{{< highlight console >}}
$ npm start
{{< /highlight >}}

to start up [webpack-dev-server](http://webpack.github.io/docs/webpack-dev-server.html) for rapid development, and

{{< highlight console >}}
$ npm run build
{{< /highlight >}}

to just run webpack once.

The Webpack configuration uses a [PostCSS](https://github.com/postcss/postcss) based pipeline for loading and transforming CSS and adding them to the DOM. That means not writing style tags but instead doing e.g.

{{< highlight js >}}
require('../css/main.css')
{{< /highlight >}}

in JS code. The CSS is also checked against the [Can I Use](http://caniuse.com/) database.

All JS code not in node modules is transformed with [Babel](https://babeljs.io/).

Hope you like it! If you find a bug, please [file an issue](https://github.com/ilkka/generator-webpack-es6-cssnext/issues) or open a pull request.
