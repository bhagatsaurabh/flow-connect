import path from "node:path";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const meta = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf8"));

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, "src/flow-connect.ts"),
      name: "__FC__",
      formats: ["iife"],
      fileName: () => "flow-connect.min.js",
    },
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
    minify: true,
  },
  define: {
    "process.env.FLOWCONNECT_VERSION": JSON.stringify(meta.version),
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
});
