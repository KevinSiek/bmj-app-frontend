import { test, expect } from '@playwright/test';
import { closeModal } from './helpers.js';

test.describe('Purchase Order Decline & Negative Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let page;
  let poId = '';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('PO-DECLINE-SETUP: Create a Purchase Order for negative testing', async () => {
    // Login as Marketing
    await page.goto('/login');
    await page.fill('input[type="email"]', 'citra.k@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Create Quotation
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
    await page.fill('input[placeholder="Company Name"]', 'PT Negative Test');
    await page.fill('input[placeholder="Address"]', 'Jl. Negative');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-123456');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('textarea[placeholder="Notes"]', 'Negative Test PO');
    
    // Add Sparepart
    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.add-sparepart .list.row').first();
    // Robust autocomplete: arm the search waiter, type char-by-char, await the API.
    const ponSearch = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
    await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });
    await ponSearch;
    await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
    await firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();
    
    // Set quantity
    await firstRow.locator('input[placeholder="Quantity"]').fill('1');
    await firstRow.locator('input[placeholder="Unit Price"]').blur();
    
    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);
    await expect(page).toHaveURL(/.*quotation/, { timeout: 20000 });

    // Move to PO
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/moveToPo') && response.request().method() === 'POST'
    );
    await page.locator('.list .item').first().click();
    const createPoBtn = page.locator('button:has-text("Create PO")');
    await expect(createPoBtn).toBeVisible({ timeout: 15000 });
    await createPoBtn.click();
    await page.fill('.modal-body textarea', 'Move to PO negative setup');
    await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
    await page.click('.button-modal button:has-text("Create PO")');
    await page.click('button:has-text("Yes")');
    
    const response = await responsePromise;
    const json = await response.json();
    poId = json.data.id;
    
    await expect(page).toHaveURL(/.*purchase-order/, { timeout: 20000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/po-decline-setup.png', fullPage: true });
  });

  test('PO-API-025: Decline PO — Marketing role blocked (UI Button Missing)', async () => {
    // Marketing is already logged in
    await page.goto('/purchase-order');
    await page.locator('.list .item').first().click();
    
    // The "Reject PO" button should not be visible for Marketing
    const rejectBtn = page.locator('button:has-text("Reject PO")');
    await expect(rejectBtn).not.toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/po-api-025-marketing-blocked.png', fullPage: true });
  });

  test('PO-API-023: Decline PO — Finance role', async () => {
    // Login as Finance
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'fajar.n@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Navigate to PO
    await page.goto(`/purchase-order/${poId}`);
    
    const rejectBtn = page.locator('button:has-text("Reject PO")');
    // Finance should be able to see and click Reject PO based on the test case
    await expect(rejectBtn).toBeVisible();
    await rejectBtn.click();
    
    // Test validation: notes required (PO-API-026 implicitly via UI if applicable)
    // For now, let's just reject it
    await page.fill('.modal-body textarea', 'Budget exceeded');
    
    const rejectResponsePromise = page.waitForResponse(response => 
      response.url().includes('/reject/') && response.request().method() === 'POST'
    );
    
    await page.click('.button-modal button:has-text("Reject")');
    await page.click('button:has-text("Yes")');
    
    const rejectResponse = await rejectResponsePromise;
    console.log(`Reject API Status: ${rejectResponse.status()}`);
    console.log(`Reject API Body:`, await rejectResponse.json());
    
    // Check success
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    
    // Check status is rejected in the list
    await page.goto(`/purchase-order`);
    await expect(page.locator('.list .item .content').first()).toContainText('Rejected', { ignoreCase: true });
    await page.screenshot({ path: 'e2e/screenshots/po-api-023-decline-success.png', fullPage: true });
  });
});
