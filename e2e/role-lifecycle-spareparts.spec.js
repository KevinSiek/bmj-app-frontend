import { test, expect } from '@playwright/test';
import { closeModal, loginAs, apiContextFor, ACCOUNTS } from './helpers.js';

/**
 * Role-Lifecycle: Full Spareparts Order
 *
 * Each role performs ONLY the actions it is authorized to do:
 *   Marketing       -> Create Quotation (UI)
 *   Director        -> Approve Quotation (API-direct)
 *   Marketing       -> moveToPo (UI)
 *   Finance         -> Create PI + DP Paid + Full Paid (UI)
 *   Inventory Admin -> Ready + Release -> DO (UI)
 *   Inventory Admin -> Mark DO Done (UI)
 *   Marketing       -> Mark PO Done (UI)
 *   Director        -> Verify final state (API)
 */
test.describe('Role Lifecycle — Spareparts Order', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(600000);

  let page;
  let poId = null;
  let piId = null;
  let quotationSlug = null;
  const QTY = 2;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('SPLT-01 Marketing creates Spareparts Quotation', async () => {
    await loginAs(page, ACCOUNTS.marketing);
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
    await page.fill('input[placeholder="Company Name"]', 'PT Spareparts Lifecycle');
    await page.fill('input[placeholder="Address"]', 'Jl. Lifecycle 1');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-999999');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('textarea[placeholder="Notes"]', 'E2E Lifecycle Spareparts');

    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.add-sparepart .list.row').first();
    const searchDone = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
    await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });
    await searchDone;
    await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
    await firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();
    await firstRow.locator('input[placeholder="Quantity"]').fill(String(QTY));
    await firstRow.locator('input[placeholder="Unit Price"]').blur();

    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);
    await expect(page).toHaveURL(/.*quotation/, { timeout: 20000 });
    await page.screenshot({ path: 'e2e/screenshots/splt-01-quotation-created.png', fullPage: true });
  });

  test('SPLT-02 Director approves Quotation (API)', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const listRes = await dir.get('/api/quotation?search=PT+Spareparts+Lifecycle');
    const items = (await listRes.json()).data?.data ?? [];
    expect(items.length, 'SPLT-02: quotation not found').toBeGreaterThan(0);
    quotationSlug = items[0].slug;

    const approveRes = await dir.post(`/api/quotation/approve/${quotationSlug}`, {
      data: { notes: 'Approved by Director (SPLT-02)' },
    });
    expect(approveRes.status(), `SPLT-02 approve: ${await approveRes.text()}`).toBe(200);
    const detail = (await (await dir.get(`/api/quotation/${quotationSlug}`)).json()).data;
    expect(detail.current_status).toMatch(/approved/i);
    await dir.dispose();
  });

  test('SPLT-03 Marketing creates PO (moveToPo)', async () => {
    await loginAs(page, ACCOUNTS.marketing);
    await page.goto('/quotation');
    await closeModal(page, { waitForAppear: 800 });
    await page.locator('.list .item').first().click();

    const createPoBtn = page.locator('button:has-text("Create PO")');
    await expect(createPoBtn).toBeVisible({ timeout: 15000 });
    await createPoBtn.click();
    await page.fill('.modal-body textarea', 'PO for Spareparts Lifecycle');
    await page.fill('.modal-body input[type="text"]', `PO-SPLT-${Date.now()}`);
    await page.click('.button-modal button:has-text("Create PO")');

    const [poRes] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/quotation/moveToPo/') && r.status() === 200, { timeout: 20000 }),
      page.click('button:has-text("Yes")'),
    ]);
    poId = (await poRes.json()).data?.id;
    expect(poId, 'SPLT-03: poId not captured').toBeTruthy();

    await page.waitForURL(/.*purchase-order/, { timeout: 20000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/splt-03-po-created.png', fullPage: true });
  });

  test('SPLT-04 Finance creates Proforma Invoice', async () => {
    await loginAs(page, ACCOUNTS.finance);
    await page.goto(`/purchase-order/${poId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.click('button:has-text("Create PI")');
    await page.fill('.modal-body textarea', 'PI for Spareparts Lifecycle');
    await page.click('.button-modal button:has-text("Create PI")');

    const [piRes] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/purchase-order/moveToPi/') && r.status() === 200, { timeout: 20000 }),
      page.click('button:has-text("Yes")'),
    ]);
    piId = (await piRes.json()).data?.id;
    expect(piId, 'SPLT-04: piId not captured').toBeTruthy();

    await page.waitForURL(/.*proforma-invoice/, { timeout: 20000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/splt-04-pi-created.png', fullPage: true });
  });

  test('SPLT-05 Finance pays DP', async () => {
    await loginAs(page, ACCOUNTS.finance);
    await page.goto(`/proforma-invoice/${piId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Set DP amount if edit button is present
    const editBtn = page.locator('button.btn-edit');
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click();
      await page.fill('input[placeholder="Advance Payment"]', '150000');
      await page.click('button:has-text("Save")');
      await page.click('button:has-text("Yes")');
      await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
      await closeModal(page);
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    }

    const dpBtn = page.locator('button:has-text("DP Paid")');
    await expect(dpBtn).toBeVisible({ timeout: 10000 });
    await dpBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/splt-05-dp-paid.png', fullPage: true });
  });

  test('SPLT-06 Finance creates Invoice (Full Paid)', async () => {
    await loginAs(page, ACCOUNTS.finance);
    await page.goto(`/proforma-invoice/${piId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // "Create Invoice" button triggers fullPaid + moveToInvoice
    const fullPaidBtn = page.locator('button:has-text("Create Invoice"), button:has-text("Full Paid")');
    await expect(fullPaidBtn.first()).toBeVisible({ timeout: 15000 });
    await fullPaidBtn.first().click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/splt-06-invoice-created.png', fullPage: true });

    // Verify invoice list has entry
    await page.goto('/invoice');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page.locator('.list .item').first()).toBeVisible({ timeout: 10000 });
  });

  test('SPLT-07 Inventory Admin sets PO Ready', async () => {
    await loginAs(page, ACCOUNTS.inventoryAdmin);
    await page.goto(`/purchase-order/${poId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const readyBtn = page.locator('button:has-text("Ready")');
    await expect(readyBtn).toBeVisible({ timeout: 15000 });
    await readyBtn.click();
    await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
    await page.click('#modalConfirmation button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/splt-07-ready.png', fullPage: true });
  });

  test('SPLT-08 Inventory Admin releases PO — creates DO', async () => {
    await loginAs(page, ACCOUNTS.inventoryAdmin);
    await page.goto(`/purchase-order/${poId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const releaseBtn = page.locator('button:has-text("Release")');
    await expect(releaseBtn).toBeVisible({ timeout: 15000 });
    await releaseBtn.click();
    await expect(page).toHaveURL(/.*delivery-order\/add/, { timeout: 20000 });

    await page.fill('input[type="date"]', '2026-06-22');
    await page.fill('input[placeholder="Received by"]', 'John Doe');
    await page.fill('input[placeholder="Picked by"]', 'Jane Smith');
    await page.fill('input[placeholder="Ship Mode"]', 'Land');
    await page.fill('input[placeholder="Order Type"]', 'Regular');

    await page.click('.button .btn-process');
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/splt-08-do-created.png', fullPage: true });
  });

  test('SPLT-09 Inventory Admin marks DO Done (Delivered)', async () => {
    await loginAs(page, ACCOUNTS.inventoryAdmin);
    await page.goto('/delivery-order');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.locator('.list .item').first().click();

    const doneBtn = page.locator('button:has-text("Done")');
    await expect(doneBtn).toBeVisible({ timeout: 15000 });
    await doneBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/splt-09-do-done.png', fullPage: true });
  });

  test('SPLT-10 Marketing marks PO Done', async () => {
    await loginAs(page, ACCOUNTS.marketing);
    await page.goto(`/purchase-order/${poId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const doneBtn = page.locator('button:has-text("Done")');
    await expect(doneBtn).toBeVisible({ timeout: 15000 });
    await doneBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await expect(doneBtn).not.toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/splt-10-po-done.png', fullPage: true });
  });

  test('SPLT-11 Verify final state: PO=Done, Invoice exists (API)', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const po = (await (await dir.get(`/api/purchase-order/${poId}`)).json()).data;
    expect(po.current_status, 'PO must be Done').toMatch(/done/i);

    const invoiceList = (await (await dir.get('/api/invoice')).json()).data?.data ?? [];
    expect(invoiceList.length, 'Invoice must have been created').toBeGreaterThan(0);
    await dir.dispose();
  });
});
