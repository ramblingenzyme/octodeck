import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { Plugin } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, './src');

// Serves src/sw.ts at /sw.js in dev mode so the SW scope covers the whole origin.
// In production the SW is emitted as a separate Rollup entry (see build.rollupOptions).
function serviceWorkerDevPlugin(): Plugin {
  return {
    name: 'service-worker-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/sw.js') return next();
        try {
          const result = await server.transformRequest('src/sw.ts');
          if (!result) return next();
          res.writeHead(200, {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Service-Worker-Allowed': '/',
            'Cache-Control': 'no-cache',
          });
          res.end(result.code);
        } catch {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [preact(), serviceWorkerDevPlugin()],
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
      input: {
        index: resolve(__dirname, 'index.html'),
        sw: resolve(__dirname, 'src/sw.ts'),
      },
      output: {
        // Emit the SW at the root of dist so its scope covers the whole origin.
        entryFileNames: (chunk) =>
          chunk.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js',
        manualChunks(id) {
          // Keep the SW as a self-contained file — don't split its dependencies.
          if (id.includes('src/sw.ts')) return undefined;
          if (id.includes('@atlaskit/pragmatic-drag-and-drop')) return 'dnd';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
