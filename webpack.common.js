import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import ResolveTypeScriptPlugin from "resolve-typescript-plugin";

export default {
  entry: {
    'flow-connect': './src/flow-connect.ts',
    'standard-nodes': {
      import: './src/standard-nodes/index.ts',
      dependOn: 'flow-connect'
    }
  },
  output: {
    path: path.resolve(dirname(fileURLToPath(import.meta.url)), 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.js'],
    plugins: [new ResolveTypeScriptPlugin()]
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  }
}
