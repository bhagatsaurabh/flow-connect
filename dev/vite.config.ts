import path from "node:path";
import { readdirSync } from "node:fs";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

function devApiPlugin(): Plugin {
  return {
    name: "flow-connect-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = decodeURI((req.url || "").split("?")[0] || "/");

          if (url === "/examples") {
            const examplesDir = path.resolve(import.meta.dirname, "scripts", "examples");
            try {
              const list = readdirSync(examplesDir);
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify(list));
              return;
            } catch (e) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "failed to read examples" }));
              return;
            }
          }

          if (url === "/test-api") {
            try {
              const result = await fetch("https://public.polygon.io/v2/market/now");
              const data = await result.json();
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify(data));
              return;
            } catch (e) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "fetch failed" }));
              return;
            }
          }

          next();
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [devApiPlugin()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 9000,
  },
});
