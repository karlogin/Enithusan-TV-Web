import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const cfBeacon = process.env.VITE_CF_BEACON_TOKEN?.trim();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cloudflare-analytics',
      transformIndexHtml(html) {
        if (!cfBeacon) return html;
        const snippet = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${cfBeacon}"}'></script>`;
        return html.replace('</head>', `    ${snippet}\n  </head>`);
      },
    },
  ],
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          hls: ['hls.js'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
});
