import path from "node:path";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const meta = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf8"));

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      entryRoot: "src",
    }),
  ],
  build: {
    lib: {
      entry: {
        "flow-connect": path.resolve(import.meta.dirname, "src/flow-connect.ts"),
        common: path.resolve(import.meta.dirname, "src/common/index.ts"),
        core: path.resolve(import.meta.dirname, "src/core/index.ts"),
        ui: path.resolve(import.meta.dirname, "src/ui/index.ts"),
        utils: path.resolve(import.meta.dirname, "src/utils/index.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}/index.${format}.js`,
    },
    sourcemap: true,
    minify: false,
    rollupOptions: {
      output: {
        chunkFileNames: "chunks/[name]-[hash].js",
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
