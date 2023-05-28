import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { merge } from "webpack-merge";
import common from "./webpack.common.js";
import * as fs from "fs";
const examples = fs.readdirSync("dev/scripts/examples/");

export default merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: [
      { directory: path.join(dirname(fileURLToPath(import.meta.url)), "dev") },
      { directory: path.join(dirname(fileURLToPath(import.meta.url)), "dist") },
      {
        directory: path.join(dirname(fileURLToPath(import.meta.url)), "node_modules/@flow-connect/audio/dist"),
      },
    ],
    onBeforeSetupMiddleware: (devServer) => {
      devServer.app.get("/examples", function (_req, res) {
        res.json(examples);
      });
    },
    compress: true,
    port: 9000,
    hot: true,
  },
});
