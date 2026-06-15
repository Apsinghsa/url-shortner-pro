import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    // Configure the proxy for API requests
    proxy: {
      // This rule says: any request that starts with '/api'
      // should be proxied to the target server.
      "/api": {
        // This is the address of your backend Express server.
        target: "http://localhost:5000",

        // This is crucial for making the proxy work correctly.
        // It changes the 'Origin' header of the request to match the target URL.
        changeOrigin: true,
      },
    },
  },
});
