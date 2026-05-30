import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Where the dev server proxies /api and /health. Defaults to the local backend
// on :3000; override (e.g. for the E2E suite, which boots a backend on its own
// port) with BACKEND_URL.
const backendTarget = process.env.BACKEND_URL ?? 'http://localhost:3000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to the backend during development so the SPA can call
    // /api/* without CORS.
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/health': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
