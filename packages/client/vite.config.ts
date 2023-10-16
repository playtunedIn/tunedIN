/// <reference types="vitest" />

import fs from 'fs';
import path from 'path';

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
          : { key: fs.readFileSync('./.cert/server.key'), cert: fs.readFileSync('./.cert/server.crt') },
      port: 8080,
      strictPort: true,
    },
    test: {
      environment: 'jsdom',
      coverage: {
        provider: 'v8',
        exclude: [...configDefaults.exclude, '**/__tests__/**', '**/dist/**', '**/public/**'],
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
        reporter: ['lcov', 'json', 'html'],
      },
      reporters: ['default'],
      setupFiles: './setup-tests.ts',
    },
    resolve: {
      alias: {
        '@assets': path.resolve(__dirname, './src/assets'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@store': path.resolve(__dirname, './src/store'),
        '@testing': path.resolve(__dirname, './src/testing'),

        'react-native': 'react-native-web',
        // Catch-all/root alias (keep at bottom)
        src: path.resolve(__dirname, './src'),
      },
    },
  });
};
