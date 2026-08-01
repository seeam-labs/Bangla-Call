import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-motion': ['motion'],
          'vendor-lucide': ['lucide-react'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
});
