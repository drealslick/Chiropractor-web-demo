import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'public-ui.spec.ts',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: 0,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
});
