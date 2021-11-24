const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        static: [
            { directory: path.join(__dirname, 'dev') },
            { directory: path.join(__dirname, 'bundles') }
        ],
        compress: true,
        port: 9000
    }
});