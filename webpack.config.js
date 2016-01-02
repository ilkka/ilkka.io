module.exports = {
    entry: {
        app: ['./scripts/main.es6']
    },
    output: {
        path: './static/js',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.es6$/,
                exclude: /node_modules/,
                loader: 'babel'
            }
        ]
    },
};
