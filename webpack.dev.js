const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const fs = require("fs");
const examples = fs.readdirSync("dev/scripts/examples/");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: [
      { directory: path.join(__dirname, "dev") },
      { directory: path.join(__dirname, "dist") },
    ],
    onBeforeSetupMiddleware: (devServer) => {
      devServer.app.get("/examples", function (_req, res) {
        res.json(examples);
      });
    },
    compress: true,
    port: 9000,
    hot: true
  },
});
