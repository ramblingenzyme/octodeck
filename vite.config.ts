import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/github-oauth': {
        target: 'https://github.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/github-oauth/, ''),
      },
    },
  },
  test: {
    environment: 'happy-dom',
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
