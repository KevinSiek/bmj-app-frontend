import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* feature-verify.spec.js is a live-data-only walkthrough (run via playwright.verify.config.js
   * against the running servers); exclude it from the regular migrate:fresh regression suite. */
  testIgnore: /feature-verify.*\.spec\.js/,
  /* Run tests in files sequentially to preserve shared test variables */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI, but also keep it at 1 locally because PHP artisan serve on Windows is single-threaded */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    actionTimeout: 10000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },

  /* Global setup to reset database */
  globalSetup: './e2e/global-setup.js',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
    actionTimeout: 10000, ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  /*
  webServer: [
    {
      command: 'php artisan serve',
      cwd: 'e:\\Kerja\\Kerja\\Bkawan\\PT_BerkatMegahJaya\\Repo\\backend\\bmj-app-backend\\BmjAppBackend',
      url: 'http://127.0.0.1:8000',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
    }
  ],
  */
});
