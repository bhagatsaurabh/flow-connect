import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { merge } from "webpack-merge";
import common from "./webpack.common.js";
import * as fs from "fs";
const examples = fs.readdirSync("dev/scripts/examples/");
import fetch from "node-fetch";

export default merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    https: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    static: [
      { directory: path.join(dirname(fileURLToPath(import.meta.url)), "dev") },
      { directory: path.join(dirname(fileURLToPath(import.meta.url)), "dist") },
      { directory: path.join(dirname(fileURLToPath(import.meta.url)), "node_modules/@flow-connect/audio/dist") },
      { directory: path.join(dirname(fileURLToPath(import.meta.url)), "node_modules/@flow-connect/common/dist") },
      { directory: path.join(dirname(fileURLToPath(import.meta.url)), "node_modules/@flow-connect/math/dist") },
      { directory: path.join(dirname(fileURLToPath(import.meta.url)), "node_modules/@flow-connect/net/dist") },
      { directory: path.join(dirname(fileURLToPath(import.meta.url)), "node_modules/@flow-connect/ui/dist") },
      { directory: path.join(dirname(fileURLToPath(import.meta.url)), "node_modules/@flow-connect/visual/dist") },
    ],
    onBeforeSetupMiddleware: (devServer) => {
      devServer.app.get("/examples", function (_req, res) {
        res.json(examples);
      });
      devServer.app.get("/test-api", async function (_req, res) {
        const result = await fetch("https://public.polygon.io/v2/market/now");
        const data = await result.json();
        res.json(data);
      });
    },
    compress: true,
    port: 9000,
    hot: true,
  },
});
