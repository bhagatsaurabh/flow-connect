import path from "node:path";
import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";

function serveFlowConnectDist(): Plugin {
  const flowConnectDist = path.resolve(import.meta.dirname, "../flow-connect/dist");
  const prefix = "/node_modules/flow-connect/dist/";

  return {
    name: "serve-flow-connect-dist",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURI((req.url || "").split("?")[0] || "");
        if (!url.startsWith(prefix)) return next();

        const rel = url.slice(prefix.length);
        const resolved = path.resolve(path.join(flowConnectDist, rel));
        if (!resolved.startsWith(flowConnectDist)) return next();

        if (existsSync(resolved) && statSync(resolved).isFile()) {
          const stream = createReadStream(resolved);
          stream.on("error", (err) => next(err));
          stream.pipe(res);
          return;
        }
        next();
      });
    },
  };
}

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
  plugins: [devApiPlugin(), serveFlowConnectDist()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 9000,
  },
});
