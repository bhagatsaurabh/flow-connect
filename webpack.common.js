import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ResolveTypeScriptPlugin from "resolve-typescript-plugin";
import webpack from "webpack";
import meta from "./package.json" assert { type: "json" };

export default {
  entry: {
    "flow-connect": "./src/flow-connect.ts",
  },
  output: {
    path: path.resolve(dirname(fileURLToPath(import.meta.url)), "dist"),
    filename: "[name].js",
    libraryTarget: "umd",
    umdNamedDefine: true,
  },
  resolve: {
    extensions: [".js"],
    plugins: [new ResolveTypeScriptPlugin()],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.FLOWCONNECT_VERSION": JSON.stringify(meta.version),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
