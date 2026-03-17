import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
