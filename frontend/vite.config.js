import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/ws": {
        target: "https://chatapp-backend-zrsg.onrender.com",
        ws: true,
        changeOrigin: true,
      },
      "/api": {
        target: "https://chatapp-backend-zrsg.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
