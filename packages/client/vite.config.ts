/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      exclude: [...configDefaults.exclude, '**/__tests__/**', '**/dist/**', '**/public/**'],
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
      reporter: ['lcov', 'json', 'html'],
    },
    reporters: ['default'],
  },
});
