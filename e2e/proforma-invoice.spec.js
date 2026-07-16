import { test, expect } from '@playwright/test';
import { closeModal } from './helpers.js';
import path from 'path';

test.describe('Proforma Invoice E2E Tests (Live DB)', () => {
  test.describe.configure({ mode: 'serial' });

  let page;
  let poId = '';
  let piId = '';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('PI-SETUP: Create a PO to test PI workflows via UI', async () => {
    test.setTimeout(90000); // 90s timeout since it does a lot
    // Login as Marketing
    await page.goto('/login');
    await page.fill('input[type="email"]', 'marketing.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Create Quotation
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
    await page.fill('input[placeholder="Company Name"]', 'PT PI Testing');
    await page.fill('input[placeholder="Address"]', 'Jl. PI 123');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-123456');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('textarea[placeholder="Notes"]', 'Setup PI PO');
    
    // Add Sparepart. Use the proven autocomplete pattern from quotation.spec.js:
    // arm the search-response waiter, type char-by-char (pressSequentially fires the
    // debounced input events that .fill() does not), await the API, then click the item.
    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.add-sparepart .list.row').first();
    const partNameInput = firstRow.locator('input[placeholder="Part Name"]');
    const searchPromise = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
    await partNameInput.pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });
    await searchPromise;
    const ddItem = firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first();
    await expect(ddItem).toBeVisible({ timeout: 10000 });
    await ddItem.click();
    await firstRow.locator('input[placeholder="Quantity"]').fill('2');
    await firstRow.locator('input[placeholder="Unit Price"]').blur();
    
    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);
    
    // Move to PO
    await page.locator('.list .item').first().click();
    await page.click('button:has-text("Create PO")');
    await page.fill('.modal-body textarea', 'Move to PO setup for PI');
    await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
    await page.click('.button-modal button:has-text("Create PO")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);

    // Extract PO ID
    const poUrl = page.url();
    poId = poUrl.split('/').pop();
    await page.screenshot({ path: 'e2e/screenshots/pi-setup-success.png', fullPage: true });
  });

  test('PI-API-008 & UI-PI-009: Move PO to PI & Check UI', async () => {
    // Logout Marketing and Login as Finance
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'finance.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/purchase-order');
    await page.locator('.list .item').first().click();
    
    await page.click('button:has-text("Create PI")');
    await page.fill('.modal-body textarea', 'DP 50% for PI');
    await page.click('.button-modal button:has-text("Create PI")');
    await page.click('button:has-text("Yes")');
    await expect(page).toHaveURL(/.*proforma-invoice/, { timeout: 20000 });
    await closeModal(page);
    
    const piUrl = page.url();
    piId = piUrl.split('/').pop();

    await page.screenshot({ path: 'e2e/screenshots/pi-api-008-move-to-pi.png', fullPage: true });
  });

  test('PI-API-003: Pay Down Payment (DP)', async () => {
    await page.goto('/proforma-invoice');
    await page.locator('.list .item').first().click();
    
    const dpPaidBtn = page.locator('button:has-text("DP Paid")');
    await expect(dpPaidBtn).toBeVisible({ timeout: 15000 });
    
    // Edit PI to set Down Payment
    await page.click('button.btn-edit');
    await page.fill('input[placeholder="Advance Payment"]', '200000');
    await page.click('button:has-text("Save")');
    await page.click('button:has-text("Yes")');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await dpPaidBtn.click();
    
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await page.screenshot({ path: 'e2e/screenshots/pi-api-003-dp-paid.png', fullPage: true });
    await expect(dpPaidBtn).not.toBeVisible();
  });

  test('PI-API-005: Pay Full -> Creates Invoice', async () => {
    await page.goto('/proforma-invoice');
    await page.locator('.list .item').first().click();
    
    const fullPaidBtn = page.locator('button:has-text("Create Invoice")');
    await expect(fullPaidBtn).toBeVisible({ timeout: 15000 });
    await fullPaidBtn.click();
    
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await page.screenshot({ path: 'e2e/screenshots/pi-api-005-full-paid.png', fullPage: true });
    
    // Verify Invoice exists
    await page.goto('/invoice');
    await expect(page.locator('.list .item').first()).toBeVisible();
  });

  test('PI-API-008 (Negative): Finance & Director roles only', async () => {
    // Login as Inventory Admin
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'inventory.admin.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    const sidebar = page.locator('.sidebar');
    await expect(sidebar.locator('text="Proforma Invoice"')).not.toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/pi-api-008-role-block.png', fullPage: true });
  });
});
