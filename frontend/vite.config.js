import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames(chunkInfo) {
          if (chunkInfo.name === "db") {
            return "assets/db.js";
          }

          return "assets/[name].js";
        },
        assetFileNames(assetInfo) {
          if (assetInfo.name === "style.css") {
            return "assets/index.css";
          }

          return "assets/[name][extname]";
        },
      },
    },
  },
  resolve: {
    alias: {
      events: "events",
    },
  },
  optimizeDeps: {
    include: ["events", "pouchdb-browser", "pouchdb-find"],
  },
  server: {
    port: 5173,
  },
});
