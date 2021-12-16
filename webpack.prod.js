const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

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
