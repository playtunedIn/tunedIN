import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      exclude: [...configDefaults.exclude, '**/__tests__/**', '**/dist/**'],
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
      reporter: ['lcov', 'json', 'html'],
    },
    reporters: ['default'],
  },
});
