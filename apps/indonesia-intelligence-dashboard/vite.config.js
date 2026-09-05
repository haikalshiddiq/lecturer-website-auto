import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        dashboard: resolve(import.meta.dirname, 'index.html'),
        weekly: resolve(import.meta.dirname, 'weekly/index.html'),
      },
    },
  },
});
