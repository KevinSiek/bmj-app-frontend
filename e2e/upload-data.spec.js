import { test, expect } from '@playwright/test';

test.describe('Upload Data E2E Tests', () => {
  test('UPLOAD-UI: Verify Upload Data page loads for Director', async ({ page }) => {
    // Login as Director
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Navigate to Upload Data
    await page.goto('/upload-data');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Ensure content is visible - the page title is inside .title class
    await expect(page.locator('text=Upload File')).toBeVisible({ timeout: 10000 });
    
    // Dropzone or file input should exist
    await expect(page.locator('.dropzone, input[type="file"]').first()).toBeAttached({ timeout: 10000 });

    await page.screenshot({ path: 'e2e/screenshots/upload-data-director.png', fullPage: true });
  });

  test('UPLOAD-UI: Verify Role Access Blocked (Marketing)', async ({ page }) => {
    // Login as Marketing
    await page.goto('/login');
    await page.fill('input[type="email"]', 'citra.k@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Marketing shouldn't see upload data
    const sidebar = page.locator('.sidebar');
    await expect(sidebar.locator('text="Upload Data"')).not.toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/upload-data-blocked.png', fullPage: true });
  });
});
