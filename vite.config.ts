import path from "node:path";
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import dts from "vite-plugin-dts";

const meta = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf8"));

function multiStaticPlugin(): Plugin {
  const staticDirs = [path.resolve(import.meta.dirname, "dev"), path.resolve(import.meta.dirname, "dist")];

  return {
    name: "flow-connect-multi-static",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = decodeURI((req.url || "").split("?")[0] || "/");

          // custom endpoints
          if (url === "/examples") {
            const examplesDir = path.resolve(import.meta.dirname, "dev", "scripts", "examples");
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

          // static file serving
          let pathname = url;
          if (pathname === "/") pathname = "/index.html";

          for (const dir of staticDirs) {
            const cleanPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
            const filePath = path.join(dir, cleanPath);
            const resolved = path.resolve(filePath);
            if (!resolved.startsWith(dir)) continue;
            if (existsSync(resolved) && statSync(resolved).isFile()) {
              res.setHeader("Access-Control-Allow-Origin", "*");
              const stream = createReadStream(resolved);
              stream.on("error", (err) => next(err));
              stream.pipe(res);
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
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    multiStaticPlugin(),
  ],
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, "src/flow-connect.ts"),
      name: "FC",
      formats: ["es", "cjs"],
      fileName: (format) => `flow-connect.${format}.js`,
    },
    sourcemap: true,
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  define: {
    "process.env.FLOWCONNECT_VERSION": JSON.stringify(meta.version),
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 9000,
  },

  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
});
