import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const securityHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  // COEP вимикаємо повністю (не додаємо цей заголовок на фронті)
  "Cross-Origin-Resource-Policy": "cross-origin",
};

export default defineConfig({
  plugins: [react()],

  base: "/",
  server: {
    headers: securityHeaders,
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: { headers: securityHeaders },
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
