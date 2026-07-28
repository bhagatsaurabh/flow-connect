import path from "node:path";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const meta = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf8"));

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
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
