import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
