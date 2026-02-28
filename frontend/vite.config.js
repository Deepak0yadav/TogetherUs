import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
              console.warn('[vite] Backend not running at localhost:4001 — start it with: npm run dev (from project root)');
            }
            // ECONNRESET = backend restarted mid-request (e.g. node --watch); avoid log spam
            if (err.code === 'ECONNRESET') return;
          });
        },
      },
      '/socket.io': {
        target: 'http://localhost:4001',
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') return; // avoid spam; backend not running
          });
        },
      },
    },
  },
});
