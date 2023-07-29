/// <reference types="vitest" />

import fs from 'fs';
import { defineConfig, loadEnv, UserConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default ({ mode }: UserConfig) => {
  process.env = { ...process.env, ...loadEnv(mode ?? '', process.cwd()) };

  const isCI = process.env.NODE_ENV === 'ci';
  const isProd = process.env.NODE_ENV === 'production';

  return defineConfig({
    plugins: [react()],
    envDir: 'configs',
    build: {
      outDir: `./${process.env.BUILD_PATH}`,
      sourcemap: true,
      manifest: true,
    },
    server: {
      https:
        isCI || isProd
          ? false
          : { key: fs.readFileSync('./.cert/private.key'), cert: fs.readFileSync('./.cert/certificate.crt') },
      port: 8080,
      strictPort: true,
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
};
