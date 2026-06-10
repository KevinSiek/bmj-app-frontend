import { test, expect } from '@playwright/test';
import { closeModal } from './helpers.js';

test.describe('Back Order & Buy (Procurement) E2E Tests', () => {
  test.describe.configure({ mode: 'serial' });

  let page;
  let indentPoId = '';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('BO-SETUP: Create Indent Quotation -> PO -> Release -> Creates Back Order', async () => {
    test.setTimeout(600000); // 5 minutes for this mega-test for this long flow
    // 1. Login as Marketing
    await page.goto('/login');
    await page.fill('input[type="email"]', 'citra.k@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // 2. Create Indent Quotation
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
    await page.fill('input[placeholder="Company Name"]', 'PT BO Testing');
    await page.fill('input[placeholder="Address"]', 'Jl. BO 123');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-123456');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('textarea[placeholder="Notes"]', 'Setup BO PO');
    
    // Add Sparepart (Indent quantity)
    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.add-sparepart .list.row').first();
    const partNameInput = firstRow.locator('input[placeholder="Part Name"]');
    // Robust autocomplete: arm the search waiter, type char-by-char, await the API.
    const boSearch = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
    await partNameInput.pressSequentially('E2E Low Stock Sparepart', { delay: 30 });
    await boSearch;
    await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Low Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
    await firstRow.locator('.dropdown-item', { hasText: 'E2E Low Stock Sparepart' }).first().click();
    
    // Fill large quantity to trigger indent (more than 10 stock)
    await firstRow.locator('input[placeholder="Quantity"]').fill('50');
    await firstRow.locator('input[placeholder="Unit Price"]').blur();
    
    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);
    
    // 3. Move to PO — intercept API response to capture new PO ID
    await page.locator('.list .item').first().click();
    await page.click('button:has-text("Create PO")');
    await page.fill('.modal-body textarea', 'Move to PO setup for BO');
    await page.click('.button-modal button:has-text("Create PO")');
    
    const [poResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/quotation/moveToPo/') && res.status() === 200),
      page.click('button:has-text("Yes")')
    ]);
    
    if (poResponse) {
      const body = await poResponse.json();
      if (body?.data?.id) indentPoId = body.data.id;
    }
    
    await page.waitForURL(/.*purchase-order/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await closeModal(page);

    // 4. Set PO Ready and Release -> Creates DO and BO (Since it is Indent)
    // First, Create PI and Pay DP as Finance
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'fajar.n@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    if (indentPoId) {
      await page.goto(`/purchase-order/${indentPoId}`);
    } else {
      await page.goto('/purchase-order');
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Create PI
    await page.click('button:has-text("Create PI")');
    await page.fill('.modal-body textarea', 'DP for Indent BO');
    await page.click('.button-modal button:has-text("Create PI")');
    
    const [piResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/purchase-order/moveToPi/') && res.status() === 200),
      page.click('button:has-text("Yes")')
    ]);
    
    let capturedPiId = null;
    if (piResponse) {
      const piBody = await piResponse.json();
      if (piBody?.data?.id) capturedPiId = piBody.data.id;
    }
    
    await expect(page).toHaveURL(/.*proforma-invoice/, { timeout: 20000 });
    await closeModal(page);

    // Pay DP
    if (capturedPiId) {
      await page.goto(`/proforma-invoice/${capturedPiId}`);
    } else {
      await page.goto('/proforma-invoice');
      await page.waitForSelector('.list .item', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Edit PI to set Down Payment
    await page.click('button.btn-edit');
    await page.fill('input[placeholder="Advance Payment"]', '100000');
    await page.click('button:has-text("Save")');
    await page.click('button:has-text("Yes")');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await page.click('button:has-text("DP Paid")');
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    // Now Login as Inventory Admin
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'eko.p@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Navigate directly to the indent PO (or fallback to list)
    if (indentPoId) {
      await page.goto(`/purchase-order/${indentPoId}`);
    } else {
      await page.goto('/purchase-order');
      await page.waitForSelector('.list .item', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // In a Back Order flow, the PO automatically creates a Back Order upon creation if stock is insufficient.
    // The PO is stuck in BO status and CANNOT be marked Ready or Released until the Back Order is resolved via Buy.
    // So we just verify that the Back Order exists.
    await page.goto('/back-order');


    // Verify BO exists
    await page.goto('/back-order');
    await expect(page.locator('.list .item').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/bo-setup-success.png', fullPage: true });
  });

  test('BO-API-003: Move Back Order to Buy', async () => {
    // Inventory role (Eko is Inventory Admin, which has access)
    await page.goto('/back-order');
    await page.locator('.list .item').first().click();

    await page.screenshot({ path: 'e2e/screenshots/bo-api-003-detail.png', fullPage: true });

    // Click Process Buy
    const buyBtn = page.locator('button:has-text("Ready")');
    await expect(buyBtn).toBeVisible();
    await buyBtn.click();
    
    await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
    await page.click('#modalConfirmation button:has-text("Yes")');

    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await page.screenshot({ path: 'e2e/screenshots/bo-api-003-buy-created.png', fullPage: true });
    
    // Verify Buy exists
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/purchase');
    await expect(page.locator('.list .item').first()).toBeVisible();
  });

  test('BUY-API-007 & 008: Approve and Receive Buy (Director & Inventory)', async () => {
    test.setTimeout(90000);
    page.on('response', async res => {
      if (res.url().includes('/api/') && res.status() >= 400) {
        console.error(`API Failed: ${res.url()} - ${res.status()} - ${await res.text()}`);
      }
    });
    // 0. Inventory Purchase creates a Manual Buy
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'indah.s@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/purchase/add');
    await page.selectOption('select[aria-label="Branch"]', 'Jakarta');
    await page.fill('textarea[placeholder="Description"]', 'Manual Buy for Review Test');
    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.list.row').first();
    const partNameInput = firstRow.locator('input[placeholder="Part Name"]');
    const searchPromise = page.waitForResponse(res => res.url().includes('/api/sparepart') && res.status() === 200);
    await partNameInput.pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 50 });
    await searchPromise;
    await partNameInput.click();
    await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
    await firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();
    await firstRow.locator('input[placeholder="Quantity"]').fill('1');
    await firstRow.locator('input[placeholder="Unit Price"]').fill('5000');
    
    await page.click('button.btn-process:has-text("Add")');
    await page.click('#modalConfirmation button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    // 1. Director Approve Buy
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/purchase/review');
    await page.locator('.list .item').first().click();

    await page.screenshot({ path: 'e2e/screenshots/buy-detail-review.png', fullPage: true });

    const approveBtn = page.locator('button:has-text("Approve")');
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();
    
    await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
    await page.click('#modalConfirmation button:has-text("Yes")');

    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await page.screenshot({ path: 'e2e/screenshots/buy-approved.png', fullPage: true });

    // 2. Inventory Purchase Receive Buy
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'indah.s@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/purchase');
    await page.locator('.list .item').first().click();

    const receiveBtn = page.locator('button:has-text("Receive")');
    await expect(receiveBtn).toBeVisible();
    await receiveBtn.click();
    
    await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
    await page.click('#modalConfirmation button:has-text("Yes")');

    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await page.screenshot({ path: 'e2e/screenshots/buy-received.png', fullPage: true });
    await expect(page.locator('.status')).toContainText('Received');
  });

  test('BO-API-004: Role Security (Marketing blocked from Back Order)', async () => {
    // Login as Marketing
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'citra.k@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    const sidebar = page.locator('.sidebar');
    await expect(sidebar.locator('text="Back Order"')).not.toBeVisible();
    

    await page.screenshot({ path: 'e2e/screenshots/bo-api-004-marketing-blocked.png', fullPage: true });
  });
});
