import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test-setup.ts'],
    coverage: {
      threshold: {
        lines: 60,
      },
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
});
