import { test, expect } from '@playwright/test';
import { closeModal } from './helpers.js';

test.describe('Purchase Order E2E Tests (Live DB)', () => {
  test.describe.configure({ mode: 'serial' });

  // Variables to hold generated data
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('PO-SETUP: Create a Purchase Order for testing', async () => {
    // 1. Login as Marketing
    await page.goto('/login');
    await page.fill('input[type="email"]', 'marketing.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // 2. Create Quotation
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
    await page.fill('input[placeholder="Company Name"]', 'PT PO Testing');
    await page.fill('input[placeholder="Address"]', 'Jl. PO 123');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-123456');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('textarea[placeholder="Notes"]', 'Setup PO');

    // Add Sparepart
    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.add-sparepart .list.row').first();

    // Select E2E Guaranteed Stock Sparepart. Robust autocomplete: arm the search
    // waiter, type char-by-char (pressSequentially fires the debounced input events
    // that .fill() does not), await the API, then click the item.
    const partNameInput = firstRow.locator('input[placeholder="Part Name"]');
    const poSearch = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
    await partNameInput.pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });
    await poSearch;

    // Wait for the dropdown to render and click the exact item
    await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
    await firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();

    // Set quantity
    await firstRow.locator('input[placeholder="Quantity"]').fill('1');
    await firstRow.locator('input[placeholder="Unit Price"]').blur();

    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);
    await expect(page).toHaveURL(/.*quotation/, { timeout: 20000 });

    // 3. Move to PO (Marketing can do this since it's already approved)
    page.on('response', response => {
      if (response.url().includes('/moveToPo') && response.request().method() === 'POST') {
        response.json().then(json => console.log('MOVE TO PO RESPONSE:', json)).catch(e => console.error(e));
      }
    });

    // The UI is already on /quotation page
    await page.locator('.list .item').first().click();
    const createPoBtn = page.locator('button:has-text("Create PO")');
    await expect(createPoBtn).toBeVisible({ timeout: 15000 });
    await createPoBtn.click();
    await page.fill('.modal-body textarea', 'Move to PO setup');
    await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
    await page.click('.button-modal button:has-text("Create PO")');
    // Await the moveToPo API response so the assertion doesn't race the navigation.
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/quotation/moveToPo/') && r.status() === 200, { timeout: 20000 }),
      page.click('button:has-text("Yes")'),
    ]);
    await expect(page).toHaveURL(/.*purchase-order/, { timeout: 20000 });
    await closeModal(page);

    // Extract PO number for later tests
    const poRow = page.locator('.list .item').first();
    await expect(poRow).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/po-setup-success.png', fullPage: true });
  });

  test('UI-PO-031: PO detail page shows Track timeline', async () => {
    // We are still logged in as Director from the setup test!
    await page.goto('/purchase-order');

    // Click on the created PO
    await page.locator('.list .item').first().click();

    // Click Track button in the top navbar
    await page.click('.page-title .track .btn');

    // Verify track component is visible
    await expect(page.locator('.popup')).toBeVisible();
    await expect(page.locator('.popup .step').first()).toBeVisible();

    // Close the track modal/offcanvas
    await page.locator('.popup .bi-x').click();
    await page.screenshot({ path: 'e2e/screenshots/po-ui-track-modal.png', fullPage: true });
  });

  test('PO-API-008: Move to PI (Finance)', async () => {
    // Logout Marketing and Login as Finance
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'finance.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Navigate to PO detail
    await page.goto('/purchase-order');
    await closeModal(page, { waitForAppear: 800 }); // clear any leftover modal before clicking
    await page.locator('.list .item').first().click();

    // Click 'Create PI'
    const createPiBtn = page.locator('button:has-text("Create PI")');
    await expect(createPiBtn).toBeVisible({ timeout: 15000 });
    await createPiBtn.click();

    // Fill notes and confirm
    await page.fill('.modal-body textarea', 'DP 50% for PI');
    await page.click('.button-modal button:has-text("Create PI")');
    // Await the moveToPi API response so the URL assertion doesn't race the navigation
    // (the default 5s toHaveURL is too tight under UI-Mode load).
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/purchase-order/moveToPi/') && r.status() === 200, { timeout: 20000 }),
      page.click('button:has-text("Yes")'),
    ]);

    // Should navigate to Proforma Invoice page
    await expect(page).toHaveURL(/.*proforma-invoice/, { timeout: 20000 });
    await closeModal(page);

    // Verify it is now in the PI list
    await expect(page.locator('.list .item').first()).toBeVisible();

    // Click the PI to open detail
    await page.locator('.list .item').first().click();

    // Click DP Paid
    const dpPaidBtn = page.locator('button:has-text("DP Paid")');
    await expect(dpPaidBtn).toBeVisible({ timeout: 15000 });
    await dpPaidBtn.click();

    // Confirm
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/po-api-008-move-to-pi.png', fullPage: true });
  });

  test('PO-API-019: Release Spareparts PO (Inventory Admin)', async () => {
    // Login as Inventory Admin
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'inventory.admin.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Navigate to PO detail
    await page.goto('/purchase-order');
    await page.locator('.list .item').first().click();
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Click 'Release'
    const releaseBtn = page.locator('button:has-text("Release")');
    await expect(releaseBtn).toBeVisible({ timeout: 15000 });
    await releaseBtn.click();

    // Should navigate to DO Add page
    await expect(page).toHaveURL(/.*delivery-order\/add/, { timeout: 20000 });

    // Fill release modal (Delivery Order form for Spareparts PO)
    await page.fill('input[type="date"]', '2026-06-03');
    await page.fill('input[placeholder="Received by"]', 'John Doe');
    await page.fill('input[placeholder="Picked by"]', 'Jane Smith');
    await page.fill('input[placeholder="Ship Mode"]', 'Land');
    await page.fill('input[placeholder="Order Type"]', 'Regular');

    // Click Release on DO form
    await page.click('.button .btn-process');

    // Confirm
    await page.click('button:has-text("Yes")');

    // Verify success and Wait for API success
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });

    // Close success modal
    await closeModal(page);
    await expect(page).toHaveURL(/.*delivery-order.*/, { timeout: 20000 });
    await page.screenshot({ path: 'e2e/screenshots/po-api-019-release-do.png', fullPage: true });
  });

  test('PO-API-020: Release blocked if DO exists & Role UI visibility', async () => {
    // Navigate back to the PO detail
    await page.goto('/purchase-order');
    await page.locator('.list .item').first().click();

    // Verify Release button is NOT visible because DO already exists
    const releaseBtn = page.locator('button:has-text("Release")');
    await expect(releaseBtn).not.toBeVisible();

    // Verify Marketing visibility restrictions:
    // Marketing shouldn't see Move to PI, Ready, or Release
    // Wait, we are logged in as Inventory Admin currently!
    // Inventory Admin shouldn't see Move to PI, but they saw Ready/Release before
    const createPiBtn = page.locator('button:has-text("Create PI")');
    await expect(createPiBtn).not.toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/po-api-020-ui-blocks.png', fullPage: true });
  });

  test('PO-API-015: Done (Marketing)', async () => {
    // Logout Inventory Admin and Login as Marketing
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'marketing.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Navigate to PO detail
    await page.goto('/purchase-order');
    await page.locator('.list .item').first().click();

    // Click 'Done'
    const doneBtn = page.locator('button:has-text("Done")');
    await expect(doneBtn).toBeVisible({ timeout: 15000 });
    await doneBtn.click();

    // Confirm
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });

    // Verify Done button disappears
    await page.screenshot({ path: 'e2e/screenshots/po-done.png', fullPage: true });
    await expect(doneBtn).not.toBeVisible();
  });

  test('PO-API-016 & PO-API-017 & PO-API-018: Service PO Flow', async () => {
    test.setTimeout(300000); // Multi-role test covering 3 scenarios
    // 1. Create Service Quotation as Marketing
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Service');
    await page.fill('input[placeholder="Company Name"]', 'PT Service Test');
    await page.fill('input[placeholder="Address"]', 'Jl. Service');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-123456');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('textarea[placeholder="Notes"]', 'Setup Service PO');

    // Add Service Details
    await page.click('button:has-text("Add Service")');
    const firstRow = page.locator('.add-service .list.row').first();
    await firstRow.locator('input[placeholder="Service Name"]').fill('E2E Engine Repair');
    await firstRow.locator('input[placeholder="Quantity"]').fill('1');
    await firstRow.locator('input[placeholder="Unit Price"]').fill('5000000');

    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);

    // Move to PO — intercept API response to capture new PO ID
    await page.locator('.list .item').first().click();
    await page.click('button:has-text("Create PO")');
    await page.fill('.modal-body textarea', 'Move to Service PO');
    await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
    await page.click('.button-modal button:has-text("Create PO")');

    const [poResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/quotation/moveToPo/') && res.status() === 200),
      page.click('button:has-text("Yes")')
    ]);

    let servicePOId = null;
    if (poResponse) {
      const body = await poResponse.json();
      if (body?.data?.id) servicePOId = body.data.id;
    }

    // Wait for navigation to PO list and for API response to be captured
    await page.waitForURL(/.*purchase-order/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await closeModal(page);
    // Fallback: if we didn't capture the ID, get the first PO from the list as Service later
    const usePOId = servicePOId;

    // Logout Marketing and Login as Finance
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'finance.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Move to PI — navigate directly to the known PO ID (or use list fallback)
    if (usePOId) {
      await page.goto(`/purchase-order/${usePOId}`);
    } else {
      await page.goto('/purchase-order');
      await page.waitForSelector('.list .item', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.click('button:has-text("Create PI")');
    await page.fill('.modal-body textarea', 'DP 50% for Service');
    await page.click('.button-modal button:has-text("Create PI")');

    // Capture PI creation response to ensure it succeeded
    const [piResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/purchase-order/moveToPi/') && res.status() === 200),
      page.click('button:has-text("Yes")')
    ]);
    expect(piResponse).toBeTruthy();

    await closeModal(page);

    // Logout Finance and Login as Service
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'service.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Verify Release Blocked (Service role not authorized) (PO-API-017)
    if (usePOId) {
      await page.goto(`/purchase-order/${usePOId}`);
    } else {
      await page.goto('/purchase-order');
      await page.waitForSelector('.list .item', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page.locator('button:has-text("Release")')).not.toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: 'e2e/screenshots/po-api-017-release-blocked.png', fullPage: true });

    // Login as Director to Release the Service PO (Release no longer requires DP Paid)
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // We are already logged in as Director from the previous steps.
    // Navigate directly to the Service PO by ID (or fallback to list)
    if (usePOId) {
      await page.goto(`/purchase-order/${usePOId}`);
    } else {
      await page.goto('/purchase-order');
      await page.waitForSelector('.list .item', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Release Service PO (PO-API-016)
    const releaseBtn = page.locator('button:has-text("Release")');
    const isVisible = await releaseBtn.isVisible();
    if (!isVisible) {
      console.log("Release button not visible. Dumping Vue state:");
      const stateDump = await page.evaluate(() => {
        const vueEl = document.querySelector('.card.my-5');
        return vueEl ? vueEl.__vueParentComponent?.ctx?.purchaseOrder : 'No vue element found';
      });
      console.log("State:", JSON.stringify(stateDump, null, 2));
      const roleState = await page.evaluate(() => localStorage.getItem('user-bmj') || 'No user in localStorage');
      console.log("Role:", roleState);
    }
    await expect(releaseBtn).toBeVisible({ timeout: 15000 });
    await releaseBtn.click();
    await expect(page).toHaveURL(/.*work-order\/add/, { timeout: 20000 });

    const dateInputs = await page.locator('input[type="date"]').all();
    for (const input of dateInputs) {
      await input.fill('2026-06-01');
    }
    await page.fill('input[placeholder="Received by"]', 'John');
    await page.fill('input[placeholder="Compiled by"]', 'Jane');
    await page.fill('input[placeholder="Approved by"]', 'Director');
    await page.fill('input[placeholder="Dept Head Service"]', 'Bob');
    await page.fill('input[placeholder="Work Performed by"]', 'Mike');
    await page.fill('input[placeholder="Scope of Work"]', 'Full overhaul');

    await page.click('button:has-text("Add Unit")');
    await page.locator('input[placeholder="Job Desc"]').first().fill('Engine repair');
    await page.locator('input[placeholder="Unit Type"]').first().fill('Generator');
    await page.locator('input[placeholder="Quantity"]').first().fill('1');

    await page.click('.button .btn-process');
    await page.click('button:has-text("Yes")');
    await page.waitForURL(/.*work-order$/, { timeout: 15000 });
    await page.screenshot({ path: 'e2e/screenshots/po-api-016-release-service.png', fullPage: true });

    // Verify Release Blocked (WO exists) (PO-API-018)
    if (usePOId) {
      await page.goto(`/purchase-order/${usePOId}`);
    } else {
      await page.goto('/purchase-order');
      await page.waitForSelector('.list .item', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page.locator('button:has-text("Release")')).not.toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: 'e2e/screenshots/po-api-018-wo-exists-block.png', fullPage: true });
  });
});
