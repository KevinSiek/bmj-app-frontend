import { test, expect } from '@playwright/test';

/**
 * Live UI verification for the 2nd 10-feature batch. NOT part of the regression gate — a
 * one-off visual walkthrough against the running :5173 + :8000 (no DB wipe).
 * Run:  npx playwright test --config=playwright.verify.config.js feature-verify-2.spec.js
 */
test.describe('Feature batch 2 — live UI verification', () => {
  test.describe.configure({ mode: 'serial' });

  async function login(page, email) {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });
  }

  test('FV2-7: "Delivery Note" label shown (renamed from Delivery Order)', async ({ page }) => {
    await login(page, 'director.jkt@bmj.com');
    // The delivery page itself renders the sidebar (with the renamed menu item) + the page title.
    await page.goto('/delivery-order');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page.locator('text=Delivery Note').first()).toBeVisible({ timeout: 10000 });
    // The old "Delivery Order" label must be gone from the menu sidebar.
    await expect(page.getByText('Delivery Order', { exact: true })).toHaveCount(0);
    await page.screenshot({ path: 'e2e/screenshots/fv2-7-delivery-note-menu.png', fullPage: true });
  });

  test('FV2-2: Marketing sparepart detail hides Selling Price + sellers', async ({ page }) => {
    await login(page, 'marketing.jkt@bmj.com'); // Marketing
    await page.goto('/spareparts');
    await page.waitForSelector('.list .item', { timeout: 10000 });
    await page.locator('.list .item').first().click();
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    // Sparepart number must be visible; Selling/Buy Price + Purchase Price section must NOT.
    await expect(page.locator('text=Selling Price')).toHaveCount(0);
    await expect(page.locator('text=Buy Price')).toHaveCount(0);
    await expect(page.locator('text=Purchase Price')).toHaveCount(0);
    await page.screenshot({ path: 'e2e/screenshots/fv2-2-marketing-sparepart.png', fullPage: true });
  });

  test('FV2-7b: Delivery Note detail has two print buttons', async ({ page }) => {
    await login(page, 'director.jkt@bmj.com');
    await page.goto('/delivery-order');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const firstItem = page.locator('.list .item').first();
    if (await firstItem.isVisible().catch(() => false)) {
      await firstItem.click();
      await page.waitForURL('**/delivery-order/*');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await expect(page.locator('button:has-text("Print Delivery Order")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('button:has-text("Print Delivery Note")')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('.title', { hasText: 'Delivery Note' }).first()).toBeVisible();
      await page.screenshot({ path: 'e2e/screenshots/fv2-7b-two-print-buttons.png', fullPage: true });
    } else {
      test.skip(true, 'No delivery order exists to open');
    }
  });

  test('FV2-1: PI detail shows No Internal Request + No PO fields', async ({ page }) => {
    await login(page, 'director.jkt@bmj.com');
    await page.goto('/proforma-invoice');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    const firstItem = page.locator('.list .item').first();
    if (await firstItem.isVisible().catch(() => false)) {
      await firstItem.click();
      await page.waitForURL('**/proforma-invoice/*');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await expect(page.locator('text=No Internal Request')).toBeVisible({ timeout: 8000 });
      await expect(page.locator('label:has-text("No PO")')).toBeVisible({ timeout: 8000 });
      await page.screenshot({ path: 'e2e/screenshots/fv2-1-pi-numbers.png', fullPage: true });
    } else {
      test.skip(true, 'No proforma invoice exists to open');
    }
  });
});
