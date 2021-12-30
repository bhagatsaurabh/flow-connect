const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  performance: {
    hints: false,
    maxEntrypointSize: 249856,
    maxAssetSize: 249856,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  }
});
