import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import TerserPlugin from 'terser-webpack-plugin';

export default merge(common, {
  mode: 'production',
  devtool: 'source-map',
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
