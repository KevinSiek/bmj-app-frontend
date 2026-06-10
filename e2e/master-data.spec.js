import { test, expect } from '@playwright/test';
import { closeModal } from './helpers.js';

test.describe('Master Data E2E Tests', () => {
  test.describe.configure({ mode: 'serial' });

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('EMP-API-009: Create Employee (Director)', async () => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/employee/add');
    const ts = Date.now();
    await page.fill('input[placeholder="Fullname"]', 'Playwright User');
    await page.fill('input[placeholder="Email"]', `pw_user_${ts}@bmj.com`);
    await page.fill('input[placeholder="Username"]', `pw_user_${ts}`);
    await page.selectOption('#role', 'Marketing');
    await page.selectOption('#branch', 'Jakarta');
    
    await page.screenshot({ path: 'e2e/screenshots/emp-api-009-form.png', fullPage: true });

    await page.click('button:has-text("Add Employee")');
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    
    // Close success modal
    await closeModal(page);
    await page.goto('/employee');
    await page.waitForSelector('.list .item');
    await expect(page.locator(`text="pw_user_${ts}"`)).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/emp-api-009-list.png', fullPage: true });
  });

  test('SP-API-003: Create Sparepart', async () => {
    await page.goto('/spareparts/add');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    await page.fill('input[placeholder="Sparepart Name"]', 'PW Engine Belt');
    await page.fill('input[placeholder="Sparepart Number"]', 'PW-1000');
    await page.fill('input[placeholder="Buy Price"]', '300000');
    await page.fill('input[placeholder="Selling Price"]', '550000');

    // Fill all branch stock inputs
    const stockInputs = await page.locator('input[placeholder="Stock"]').all();
    for (const input of stockInputs) {
      await input.fill('10');
    }

    // Add Seller
    await page.click('button:has-text("Add Seller")');
    // Select first available seller
    await page.selectOption('.lists select', { index: 1 });
    await page.fill('input[placeholder="Purchase Price"]', '280000');
    await page.fill('input[placeholder="Quantity"]', '100');
    
    await page.screenshot({ path: 'e2e/screenshots/sp-api-003-form.png', fullPage: true });

    await page.click('button.btn-process');
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await page.goto('/spareparts?search=PW-1000');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page.locator('text="PW-1000"')).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: 'e2e/screenshots/sp-api-003-list.png', fullPage: true });
  });

  test('GEN-API-007: Update General Settings', async () => {
    await page.goto('/general');
    
    await page.fill('input[placeholder="Discount"]', '0.15');
    await page.fill('input[placeholder="VAT"]', '0.12');
    
    await page.screenshot({ path: 'e2e/screenshots/gen-api-007-form.png', fullPage: true });

    await page.click('button:has-text("Update Data")');
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await page.screenshot({ path: 'e2e/screenshots/gen-api-007-saved.png', fullPage: true });
  });
});
