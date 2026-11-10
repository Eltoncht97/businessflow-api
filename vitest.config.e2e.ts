import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    env: {
      NODE_ENV: 'test',
      PORT: '3000',
      DATABASE_URL: 'postgresql://unused:unused@localhost:5432/unused',
    },
    root: './',
    include: ['**/*.e2e-spec.ts', '**/*.integration-spec.ts'],
  },
});
