// One-off config for the live feature-verify pass (e2e/feature-verify.spec.js). Reuses the
// already-running :5173 and :8000 servers and does NOT run global-setup (which would
// migrate:fresh --seed and wipe the live dev DB). Run:
//   npx playwright test --config=playwright.verify.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /feature-verify.*\.spec\.js/,
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // NO globalSetup, NO webServer — use the live servers and live data.
});
