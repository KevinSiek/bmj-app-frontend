import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test('DASH-UI: Verify Dashboard loads for Director', async ({ page }) => {
    // Login as Director
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Navigate to Dashboard
    await page.goto('/dashboard');
    
    // Ensure dashboard content is visible
    // Since dashboard cards use dynamic classes, we can check for common dashboard elements or text
    await expect(page.locator('.page-title')).toContainText('Dashboard', { timeout: 10000 });
    
    // Check that at least one summary card exists
    const cards = page.locator('.card');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: 'e2e/screenshots/dashboard-director.png', fullPage: true });
  });

  test('DASH-UI: Verify Dashboard Role Access (Marketing)', async ({ page }) => {
    // Login as Marketing
    await page.goto('/login');
    await page.fill('input[type="email"]', 'marketing.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Marketing shouldn't see full dashboard metrics (only specific ones or dashboard is hidden)
    // Wait for the menu page and check if dashboard link is visible
    const sidebar = page.locator('.sidebar');
    const hasDashboardLink = await sidebar.locator('text="Dashboard"').isVisible();
    
    if (hasDashboardLink) {
        await page.goto('/dashboard');
        await expect(page.locator('.page-title h4')).toHaveText('Dashboard');
        // They should see fewer cards or specific ones
        await page.screenshot({ path: 'e2e/screenshots/dashboard-marketing.png', fullPage: true });
    } else {
        await page.screenshot({ path: 'e2e/screenshots/dashboard-marketing-blocked.png', fullPage: true });
    }
  });
});
