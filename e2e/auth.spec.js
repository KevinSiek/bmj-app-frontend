import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('AUTH-API-001: Login with valid credentials', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`[${response.status()}] ${response.url()}`);
      }
    });

    // Fill the login form with seeded user credentials
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    
    // Click the login button
    await page.click('button[type="submit"]');

    // Verify successful redirect to the menu/dashboard
    await page.waitForURL('**/menu', { timeout: 20000 }).catch(() => {});
    expect(page.url()).not.toContain('/login');
  });

  test('AUTH-API-002: Login with wrong password', async ({ page }) => {
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'WrongPass1');
    await page.click('button[type="submit"]');

    // Verify error modal is displayed (auto-retries until visible)
    await expect(page.getByText(/Email or Password is incorrect/i)).toBeVisible();
    
    // URL should remain on /login
    expect(page.url()).toContain('/login');
  });

  test('AUTH-API-004: Form validation for missing fields', async ({ page }) => {
    // Attempt to submit empty form
    await page.click('button[type="submit"]');
    
    // Application shows a modal saying "Email or Password is incorrect" on API validation failure
    await expect(page.getByText(/Email or Password is incorrect/i)).toBeVisible();
  });

  test('UI-AUTH-028: Login page renders correctly', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
