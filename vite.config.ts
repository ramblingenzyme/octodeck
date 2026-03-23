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
      // Proxies /api/* to the Cloudflare Pages dev server.
      // Run `npm run build && npm run dev:api` in a second terminal,
      // with secrets in .dev.vars (see .dev.vars.example).
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    pool: 'vmThreads',
    alias: [{ find: '@', replacement: srcPath }],
    setupFiles: ['test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts'],
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    alias: [{ find: '@', replacement: srcPath }],
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks(id) {
          if (id.includes('@atlaskit/pragmatic-drag-and-drop')) return 'dnd';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
