import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// Standalone preview/playground for the design system. apps/admin will consume
// the package as source; this is just so the kit is viewable on its own.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: resolve(__dirname, "preview"),
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  server: { port: 4002 },
});
