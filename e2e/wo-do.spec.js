import { test, expect } from '@playwright/test';
import { closeModal } from './helpers.js';

test.describe('Work Order & Delivery Order E2E Tests', () => {
  test.describe.configure({ mode: 'serial' });

  // Variables to hold generated data
  let page;
  let servicePoId = '';
  let sparepartPoId = '';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    page.on('response', async res => {
      if (res.status() >= 400 && res.url().includes('/api/')) {
        console.log('API ERROR ' + res.status() + ' ' + res.url() + ' BODY:', await res.text().catch(() => 'no body'));
      }
      if (res.status() === 200 && res.url().includes('/api/quotation') && res.request().method() === 'GET') {
        const body = await res.json().catch(() => null);
        if (body && body.data && body.data.data) {
          console.log('QUOTATION LIST:', body.data.data.map(q => ({ num: q.quotation_number, cust: q.customer?.company_name, branch: q.branch })));
        }
      }
    });
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('WO-SETUP: Create Service Quotation, Move to PO, Move to PI, Pay DP, Set Ready', async () => {
    test.setTimeout(120000);
    test.setTimeout(300000); // 180 seconds timeout for this long setup
    // 1. Create Service Quotation as Marketing
    await page.goto('/login');
    await page.fill('input[type="email"]', 'marketing.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    const responsePromise = page.waitForResponse(response => response.url().includes('/api/login'));
    await page.click('button[type="submit"]');
    const response = await responsePromise;
    console.log('Login Request Body:', await response.request().postData());
    console.log('Login Status:', response.status());
    if (response.status() !== 200) {
      console.log('Login Failed body:', await response.json());
    }
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Service');
    await page.fill('input[placeholder="Company Name"]', 'PT WO Test');
    await page.fill('input[placeholder="Address"]', 'Jl. WO');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-123456');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('input[placeholder="NPWP"]', '01.234.567.8-901.234');
    await page.fill('input[placeholder="Email"]', 'client@test.com');
    await page.fill('input[placeholder="NPWP"]', '01.234.567.8-901.234');
    await page.fill('input[placeholder="Email"]', 'client@test.com');
    await page.fill('textarea[placeholder="Notes"]', 'Setup WO PO');
    
    // Add Service Details
    await page.click('button:has-text("Add Service")');
    const firstRow = page.locator('.add-service .list.row').first();
    await firstRow.locator('input[placeholder="Service Name"]').fill('E2E Engine Repair');
    await firstRow.locator('input[placeholder="Quantity"]').fill('1');
    await firstRow.locator('input[placeholder="Unit Price"]').fill('5000000');
    
    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);
    
    // Move to PO — navigate explicitly to the quotation list
    await page.goto('/quotation');
    await page.waitForSelector('.list .item', { state: 'visible', timeout: 15000 });
    // Dismiss any lingering success modal that may have reappeared after navigation
    await closeModal(page, { waitForAppear: 800 });
    await page.locator('.list .item').first().click();
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.click('button:has-text("Create PO")');
    await page.fill('.modal-body textarea', 'Move to Service PO');
    await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
    await page.click('.button-modal button:has-text("Create PO")');
    
    const [poResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/quotation/moveToPo/') && res.status() === 200),
      page.click('button:has-text("Yes")')
    ]);
    
    let capturedPoId = null;
    if (poResponse) {
      const body = await poResponse.json();
      if (body?.data?.id) capturedPoId = body.data.id;
    }

    // Wait for navigation and for API response to be captured
    await page.waitForURL(/.*purchase-order/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await closeModal(page);
    servicePoId = capturedPoId;

    // Logout Marketing and Login as Finance
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'finance.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    const responsePromise2 = page.waitForResponse(response => response.url().includes('/api/login'));
    await page.click('button[type="submit"]');
    const response2 = await responsePromise2;
    console.log('Login Request Body:', await response2.request().postData());
    console.log('Login Status:', response2.status());
    if (response2.status() !== 200) {
      console.log('Login Failed body:', await response2.json());
    }
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Move to PI — navigate directly to the known PO ID (or fallback to list)
    if (servicePoId) {
      await page.goto(`/purchase-order/${servicePoId}`);
    } else {
      await page.goto('/purchase-order');
      await page.waitForSelector('.list .item', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.click('button:has-text("Create PI")');
    await page.fill('.modal-body textarea', 'DP 50% for Service');
    await page.click('.button-modal button:has-text("Create PI")');
    
    // Capture PI ID when confirming
    const [piResponseWo] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/purchase-order/moveToPi/') && res.status() === 200),
      page.click('button:has-text("Yes")')
    ]);
    
    let capturedWoPiId = null;
    if (piResponseWo) {
      const piBodyWo = await piResponseWo.json();
      if (piBodyWo?.data?.id) capturedWoPiId = piBodyWo.data.id;
    }
    await closeModal(page);

    // Pay DP
    if (capturedWoPiId) {
      await page.goto(`/proforma-invoice/${capturedWoPiId}`);
    } else {
      await page.goto('/proforma-invoice');
      await page.waitForSelector('.list .item', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Edit PI to set Down Payment
    await page.click('button.btn-edit');
    await page.fill('input[placeholder="Advance Payment"]', '150000');
    await page.click('button:has-text("Save")');
    await page.click('button:has-text("Yes")');
    // Let closeModal handle the success modal
    await closeModal(page);

    await page.click('button:has-text("DP Paid")');
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);
    await page.waitForTimeout(2000);

    // Logout Finance and Login as Director to set Service PO to Ready
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    if (servicePoId) {
      await page.goto(`/purchase-order/${servicePoId}`);
    } else {
      await page.goto('/purchase-order');
      await page.waitForSelector('.list .item', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    // Ready button is gated on the PO detail re-fetching its DP-paid status; wait for it
    // to render rather than clicking immediately (mirrors purchase-order.spec.js PO-API-012).
    const readyBtn = page.locator('button:has-text("Ready")');
    await expect(readyBtn).toBeVisible({ timeout: 15000 });
    await readyBtn.click();
    await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
    await page.click('#modalConfirmation button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);
    await page.waitForTimeout(2000);

    // We are already logged in as Director from the previous steps.
    // Navigate directly to the Service PO by ID (or fallback to list)
    if (servicePoId) {
      await page.goto(`/purchase-order/${servicePoId}`);
    } else {
      await page.goto('/purchase-order');
      await page.waitForSelector('.list .item', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Release Service PO -> Creates WO
    const releaseBtn = page.locator('button:has-text("Release")');
    await expect(releaseBtn).toBeVisible({ timeout: 15000 });
    await releaseBtn.click();
    await expect(page).toHaveURL(/.*work-order\/add/, { timeout: 20000 });
    
    const dateInputs = await page.locator('input[type="date"]').all();
    for (const input of dateInputs) {
      await input.fill('2026-06-01');
    }
    await page.fill('input[placeholder="Received by"]', 'John');
    await page.fill('input[placeholder="Dept Head Service"]', 'Bob');
    await page.fill('input[placeholder="Scope of Work"]', 'Full overhaul');
    await page.locator('input[placeholder="Job Desc"]').first().fill('Engine repair');
    await page.locator('input[placeholder="Unit Type"]').first().fill('Generator');
    await page.locator('input[placeholder="Quantity"]').first().fill('1');
    await page.locator('input[placeholder="Job"]').first().fill('Install new block');
    await page.locator('input[placeholder="Job"]').first().fill('Install new block');

    await page.click('.button .btn-process');
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/wo-setup-success.png', fullPage: true });
  });

  test('WO-API-003: Update Work Order status (Service Role)', async () => {
    await page.goto('/work-order');
    await page.locator('.list .item').first().click();

    await page.screenshot({ path: 'e2e/screenshots/wo-api-003-detail.png', fullPage: true });

    // Click Process first to transition status
    const processBtn = page.locator('button:has-text("Process")');
    await expect(processBtn).toBeVisible();
    await processBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);
    await page.waitForTimeout(1000);

    // Click Done
    const today3 = new Date();
    const formattedDate3 = `${today3.getFullYear()}-${(today3.getMonth()+1).toString().padStart(2, '0')}-02`;
    const dateInputs2 = await page.locator('input[type="date"]').all();
    for (const input of dateInputs2) {
      if (await input.isEnabled()) {
         await input.fill(formattedDate3);
      }
    }
    await page.locator('input[placeholder="Work Performed by"]').last().fill('WorkerName');
    await page.locator('textarea[placeholder="Notes"]').last().fill('Task finished');
    const doneBtn = page.locator('button:has-text("Done")');
    await expect(doneBtn).toBeVisible();
    await doneBtn.click();
    
    // Confirm in Global Modal
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/wo-api-003-done.png', fullPage: true });
  });

  test('DO-SETUP: Create a Spareparts PO and Release to DO', async () => {
    test.setTimeout(120000);
    // Login as Marketing
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'marketing.smg@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Create Quotation
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
    await page.fill('input[placeholder="Company Name"]', 'PT DO Test');
    await page.fill('input[placeholder="Address"]', 'Jl. DO 123');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-123456');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('input[placeholder="NPWP"]', '01.234.567.8-901.234');
    await page.fill('input[placeholder="Email"]', 'client@test.com');
    await page.fill('input[placeholder="NPWP"]', '01.234.567.8-901.234');
    await page.fill('input[placeholder="Email"]', 'client@test.com');
    await page.fill('textarea[placeholder="Notes"]', 'Setup DO PO');
    
    // Add Sparepart
    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.add-sparepart .list.row').first();
    const partNameInput = firstRow.locator('input[placeholder="Part Name"]');
    // Robust autocomplete: arm the search waiter, type char-by-char, await the API.
    await partNameInput.click();
    await partNameInput.fill('E2E Guaranteed Stock Sparepar'); // leave out 't'
    await partNameInput.pressSequentially('t', { delay: 100 }); // type 't' to trigger autocomplete
    // Wait for dropdown to show the item
    await expect(page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
    await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();
    await firstRow.locator('input[placeholder="Quantity"]').fill('1');
    await firstRow.locator('input[placeholder="Unit Price"]').blur();
    
    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);
    
    // Move to PO â€” navigate explicitly to the quotation list
    await page.goto('/quotation');
    await page.waitForSelector('.list .item', { state: 'visible', timeout: 15000 });
    // Dismiss any lingering success modal that may have reappeared after navigation
    await closeModal(page, { waitForAppear: 800 });
    await page.locator('.list .item').first().click();
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.click('button:has-text("Create PO")');
    await page.fill('.modal-body textarea', 'Move to DO setup');
    await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
    await page.click('.button-modal button:has-text("Create PO")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);

    // Director creates PI and pays DP
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/purchase-order');
    await page.locator('.list .item').first().click();
    
    // Create PI
    await page.click('button:has-text("Create PI")');
    await page.fill('.modal-body textarea', 'Payment 50%');
    await page.click('.button-modal button:has-text("Create PI")');
    await page.click('#modalConfirmation button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);
    await page.waitForTimeout(1500);

    // Pay DP
    await page.goto('/proforma-invoice');
    await page.locator('.list .item').first().click();
    await page.click('button:has-text("DP Paid")');
    await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
    await page.click('#modalConfirmation button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);
    await page.waitForTimeout(1500);

    // Logout and login as Inventory Admin Semarang (only SMG can release Spareparts PO)
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'inventory.admin.smg@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Set Ready
    await page.goto('/purchase-order');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.locator('.list .item').first().click();
    const doReadyBtn = page.locator('button:has-text("Ready")');
    await expect(doReadyBtn).toBeVisible({ timeout: 15000 });
    await doReadyBtn.click();
    await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
    await page.click('#modalConfirmation button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'e2e/screenshots/do-setup-before-release.png', fullPage: true });

    // Release DO
    await page.click('button:has-text("Release")');
    await expect(page).toHaveURL(/.*delivery-order\/add/, { timeout: 20000 });
    
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-03`;
    await page.fill('input[type="date"]', formattedDate);
    await page.fill('input[placeholder="Received by"]', 'John Doe');
    await page.fill('input[placeholder="Picked by"]', 'Jane Smith');
    await page.fill('input[placeholder="Ship Mode"]', 'Land');
    await page.fill('input[placeholder="Order Type"]', 'Regular');
    
    await page.click('.button .btn-process');
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/do-setup-success.png', fullPage: true });
  });

  test('DO-API-008: Update DO Status to Delivered (Inventory Admin Role)', async () => {
    await page.goto('/delivery-order');
    await page.waitForLoadState('networkidle');
    await page.locator('.list .item').first().click();

    await page.screenshot({ path: 'e2e/screenshots/do-api-008-detail.png', fullPage: true });

    const today2 = new Date();
    const formattedDate2 = `${today2.getFullYear()}-${(today2.getMonth()+1).toString().padStart(2, '0')}-02`;
    const dateInputs2 = await page.locator('input[type="date"]').all();
    for (const input of dateInputs2) {
      if (await input.isEnabled()) {
         await input.fill(formattedDate2);
      }
    }

    const processBtn = page.locator('button:has-text("Process")');
    await expect(processBtn).toBeVisible();
    await processBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);
    await page.waitForTimeout(1000);

    const doneBtn = page.locator('button:has-text("Done")');
    await expect(doneBtn).toBeVisible();
    await doneBtn.click();
    
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await page.screenshot({ path: 'e2e/screenshots/do-api-008-done.png', fullPage: true });
  });

  test('DO-API-007: Role Access Blocked (Finance)', async () => {
    // Finance role shouldn't see DO
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'finance.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Expecting the navigation bar not to have Delivery Order
    const sidebar = page.locator('.sidebar');
    await expect(sidebar.locator('text="Delivery Order"')).not.toBeVisible();
    
    await page.screenshot({ path: 'e2e/screenshots/do-api-007-role-blocked.png', fullPage: true });
  });
});
