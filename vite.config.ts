import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const meta = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf8"));

const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function multiStaticPlugin() {
  const staticDirs = [
    path.resolve(__dirname, "dev"),
    path.resolve(__dirname, "dist"),
    /* path.resolve(__dirname, "node_modules/@flow-connect/audio/dist"),
    path.resolve(__dirname, "node_modules/@flow-connect/common/dist"),
    path.resolve(__dirname, "node_modules/@flow-connect/math/dist"),
    path.resolve(__dirname, "node_modules/@flow-connect/net/dist"),
    path.resolve(__dirname, "node_modules/@flow-connect/ui/dist"),
    path.resolve(__dirname, "node_modules/@flow-connect/visual/dist"), */
  ];

  return {
    name: "flow-connect-multi-static",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        try {
          const url = decodeURI((req.url || "").split("?")[0] || "/");

          // custom endpoints
          if (url === "/examples") {
            const examplesDir = path.resolve(__dirname, "dev", "scripts", "examples");
            try {
              const list = fs.readdirSync(examplesDir);
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
            if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
              const ext = path.extname(resolved).toLowerCase();
              const type = mimeTypes[ext] || "application/octet-stream";
              res.setHeader("Content-Type", type);
              res.setHeader("Access-Control-Allow-Origin", "*");
              const stream = fs.createReadStream(resolved);
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
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/flow-connect.ts"),
      name: "FC",
      formats: ["umd"],
      fileName: () => "flow-connect.js",
    },
    sourcemap: true,
  },
  define: {
    "process.env.FLOWCONNECT_VERSION": JSON.stringify(meta.version),
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 9000,
    strictPort: true,
    open: true,
  },
  plugins: [multiStaticPlugin()],
});
