import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    proxy: {
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    target: "esnext",
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
});
