import { test, expect } from '@playwright/test';
import { closeModal } from './helpers.js';

test.describe('Invoice E2E Tests (Live DB)', () => {
  test.describe.configure({ mode: 'serial' });

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('INV-SETUP: Create Full Pipeline to generate Invoice', async () => {
    test.setTimeout(300000); // Extended timeout for full pipeline
    
    // Login as Marketing
    await page.goto('/login');
    await page.fill('input[type="email"]', 'citra.k@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Create Quotation
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
    await page.fill('input[placeholder="Company Name"]', 'PT Invoice Test');
    await page.fill('input[placeholder="Address"]', 'Jl. Invoice 123');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-123456');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('textarea[placeholder="Notes"]', 'Setup Invoice');
    
    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.add-sparepart .list.row').first();
    // Robust autocomplete: arm the search waiter, type char-by-char, await the API.
    const invSearch = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
    await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });
    await invSearch;
    await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
    await firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();
    await firstRow.locator('input[placeholder="Quantity"]').fill('1');
    await firstRow.locator('input[placeholder="Unit Price"]').blur();
    
    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);

    // Create PO
    await page.locator('.list .item').first().click();
    await page.click('button:has-text("Create PO")');
    await page.fill('.modal-body textarea', 'Move to PO setup');
    await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
    await page.click('.button-modal button:has-text("Create PO")');
    
    const [poResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/quotation/moveToPo/') && res.status() === 200),
      page.click('button:has-text("Yes")')
    ]);
    
    let poId = null;
    if (poResponse) {
      const poBody = await poResponse.json();
      if (poBody?.data?.id) poId = poBody.data.id;
    }
    
    await page.waitForURL(/.*purchase-order/, { timeout: 15000 });
    await closeModal(page);

    // Login Finance
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'fajar.n@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Create PI
    if (poId) await page.goto(`/purchase-order/${poId}`);
    else {
      await page.goto('/purchase-order');
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.click('button:has-text("Create PI")');
    await page.fill('.modal-body textarea', 'PI for Invoice');
    await page.click('.button-modal button:has-text("Create PI")');
    const [piResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/purchase-order/moveToPi/') && res.status() === 200),
      page.click('button:has-text("Yes")')
    ]);
    
    let piId = null;
    if (piResponse) {
      const piBody = await piResponse.json();
      if (piBody?.data?.id) piId = piBody.data.id;
    }
    await page.waitForURL(/.*proforma-invoice/, { timeout: 15000 });
    await closeModal(page);

    // Full Pay PI -> Creates Invoice
    if (piId) await page.goto(`/proforma-invoice/${piId}`);
    else {
      await page.goto('/proforma-invoice');
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    const fullPaidBtn = page.locator('button:has-text("Create Invoice")');
    await expect(fullPaidBtn).toBeVisible({ timeout: 15000 });
    await fullPaidBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);
  });

  test('INV-API-001: View Invoice List and Details (Finance)', async () => {
    // Navigate to Invoice list
    await page.goto('/invoice');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    await expect(page.locator('.list .item').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/invoice-list.png', fullPage: true });

    // Open detail
    await page.locator('.list .item').first().click();
    // Wait for detail text
    
    // Check elements on Invoice Detail
    await expect(page.locator('.title', { hasText: 'Customer' }).first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/invoice-detail.png', fullPage: true });
  });
});
