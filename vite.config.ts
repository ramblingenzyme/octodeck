import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, './src');

export default defineConfig({
  plugins: [preact()],
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
    pool: 'vmThreads',
    alias: [{ find: '@', replacement: srcPath }],
    setupFiles: ['src/test/setup.ts'],
  },
  resolve: {
    alias: [{ find: '@', replacement: srcPath }],
  },
});
