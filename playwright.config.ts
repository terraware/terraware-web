import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './playwright/e2e/suites',
  // Folder for test artifacts such as screenshots, videos, traces, etc.
  outputDir: './playwright/test-results',

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests. */
  workers: process.env.CI ? 2 : 4,
  /* Reporter(s) to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace for the first failure. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? 'retain-on-first-failure' : 'on',

    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: parseInt(process.env.SLOW_MO || '0'),
    },
  },
  timeout: process.env.CI ? 60000 : parseInt(process.env.TIMEOUT || '15000'),

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'dev',
      /* Test with an unoptimized developer build */
      use: { baseURL: 'http://localhost:3000', ...devices['Desktop Chrome'] },
    },
    {
      name: 'prod',
      /* Test with an optimized developer build served with nginx. Make sure to run `yarn build && yarn server:reset` first. */
      use: { baseURL: 'http://localhost:3001', ...devices['Desktop Chrome'] },
    },
  ],
});
