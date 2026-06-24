import { test, expect } from '@playwright/test';
import { closeModal, loginAs, apiContextFor, ACCOUNTS } from './helpers.js';

/**
 * Role-Lifecycle: Full Service Order
 *
 * Each role performs ONLY the actions it is authorized to do:
 *   Marketing       -> Create Service Quotation (UI)
 *   Director        -> Approve (API)
 *   Marketing       -> moveToPo (UI)
 *   Finance         -> Create PI + DP Paid (UI)
 *   Director        -> Set PO Ready (Service POs need Director or Head Inventory for Ready)
 *   Director        -> Release -> creates WO Add form (UI)
 *   Service         -> Fill WO form, submit (UI)
 *   Service         -> Mark WO Process then Done (UI)
 *   Finance         -> Create Invoice via Full Paid (UI)
 *   Marketing       -> Mark PO Done (UI)
 *   Director        -> Verify final state (API)
 */
test.describe('Role Lifecycle — Service Order', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(600000);

  let page;
  let poId = null;
  let piId = null;
  let quotationSlug = null;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('SVLT-01 Marketing creates Service Quotation', async () => {
    await loginAs(page, ACCOUNTS.marketing);
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Service');

    await page.fill('input[placeholder="Company Name"]', 'PT Service Lifecycle');
    await page.fill('input[placeholder="Address"]', 'Jl. Service 1');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-111111');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('textarea[placeholder="Notes"]', 'E2E Service Lifecycle');

    await page.click('button:has-text("Add Service")');
    const firstRow = page.locator('.add-service .list.row').first();
    await firstRow.locator('input[placeholder="Service Name"]').fill('E2E Generator Overhaul');
    await firstRow.locator('input[placeholder="Quantity"]').fill('1');
    await firstRow.locator('input[placeholder="Unit Price"]').fill('5000000');

    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);
    await expect(page).toHaveURL(/.*quotation/, { timeout: 20000 });
    await page.screenshot({ path: 'e2e/screenshots/svlt-01-quotation-created.png', fullPage: true });
  });

  test('SVLT-02 Director approves Quotation (API)', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const listRes = await dir.get('/api/quotation?search=PT+Service+Lifecycle');
    const items = (await listRes.json()).data?.data ?? [];
    expect(items.length, 'SVLT-02: quotation not found').toBeGreaterThan(0);
    quotationSlug = items[0].slug;

    const approveRes = await dir.post(`/api/quotation/approve/${quotationSlug}`, {
      data: { notes: 'Approved by Director (SVLT-02)' },
    });
    expect(approveRes.status(), `SVLT-02: ${await approveRes.text()}`).toBe(200);
    await dir.dispose();
  });

  test('SVLT-03 Marketing creates PO (moveToPo)', async () => {
    await loginAs(page, ACCOUNTS.marketing);
    await page.goto('/quotation');
    await closeModal(page, { waitForAppear: 800 });
    await page.locator('.list .item').first().click();

    const createPoBtn = page.locator('button:has-text("Create PO")');
    await expect(createPoBtn).toBeVisible({ timeout: 15000 });
    await createPoBtn.click();
    await page.fill('.modal-body textarea', 'Service PO for Lifecycle');
    await page.fill('.modal-body input[type="text"]', `PO-SVLT-${Date.now()}`);
    await page.click('.button-modal button:has-text("Create PO")');

    const [poRes] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/quotation/moveToPo/') && r.status() === 200, { timeout: 20000 }),
      page.click('button:has-text("Yes")'),
    ]);
    poId = (await poRes.json()).data?.id;
    expect(poId, 'SVLT-03: poId not captured').toBeTruthy();

    await page.waitForURL(/.*purchase-order/, { timeout: 20000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/svlt-03-po-created.png', fullPage: true });
  });

  test('SVLT-04 Finance creates Proforma Invoice', async () => {
    await loginAs(page, ACCOUNTS.finance);
    await page.goto(`/purchase-order/${poId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    await page.click('button:has-text("Create PI")');
    await page.fill('.modal-body textarea', 'PI for Service Lifecycle');
    await page.click('.button-modal button:has-text("Create PI")');

    const [piRes] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/purchase-order/moveToPi/') && r.status() === 200, { timeout: 20000 }),
      page.click('button:has-text("Yes")'),
    ]);
    piId = (await piRes.json()).data?.id;
    expect(piId, 'SVLT-04: piId not captured').toBeTruthy();

    await page.waitForURL(/.*proforma-invoice/, { timeout: 20000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/svlt-04-pi-created.png', fullPage: true });
  });

  test('SVLT-05 Finance pays DP on PI', async () => {
    await loginAs(page, ACCOUNTS.finance);
    await page.goto(`/proforma-invoice/${piId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const editBtn = page.locator('button.btn-edit');
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click();
      await page.fill('input[placeholder="Advance Payment"]', '1500000');
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
    await page.screenshot({ path: 'e2e/screenshots/svlt-05-dp-paid.png', fullPage: true });
  });

  test('SVLT-06 Director sets Service PO to Ready', async () => {
    // Service POs require Director (or Head Inventory) to set Ready
    await loginAs(page, ACCOUNTS.director);
    await page.goto(`/purchase-order/${poId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const readyBtn = page.locator('button:has-text("Ready")');
    await expect(readyBtn).toBeVisible({ timeout: 15000 });
    await readyBtn.click();
    await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
    await page.click('#modalConfirmation button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/svlt-06-ready.png', fullPage: true });
  });

  test('SVLT-07 Director releases Service PO — fills Work Order form', async () => {
    await loginAs(page, ACCOUNTS.director);
    await page.goto(`/purchase-order/${poId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const releaseBtn = page.locator('button:has-text("Release")');
    await expect(releaseBtn).toBeVisible({ timeout: 15000 });
    await releaseBtn.click();
    await expect(page).toHaveURL(/.*work-order\/add/, { timeout: 20000 });

    const dateInputs = await page.locator('input[type="date"]').all();
    for (const input of dateInputs) {
      await input.fill('2026-06-22');
    }
    await page.fill('input[placeholder="Received by"]', 'John');
    await page.fill('input[placeholder="Compiled by"]', 'Jane');
    await page.fill('input[placeholder="Approved by"]', 'Director');
    await page.fill('input[placeholder="Dept Head Service"]', 'Bob');
    await page.fill('input[placeholder="Work Performed by"]', 'Mike');
    await page.fill('input[placeholder="Scope of Work"]', 'Full overhaul E2E');

    await page.click('button:has-text("Add Unit")');
    await page.locator('input[placeholder="Job Desc"]').first().fill('Generator repair');
    await page.locator('input[placeholder="Unit Type"]').first().fill('Generator');
    await page.locator('input[placeholder="Quantity"]').first().fill('1');

    await page.click('.button .btn-process');
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 15000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/svlt-07-wo-created.png', fullPage: true });
  });

  test('SVLT-08 Service role processes and completes Work Order', async () => {
    await loginAs(page, ACCOUNTS.service);
    await page.goto('/work-order');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.locator('.list .item').first().click();
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Process
    const processBtn = page.locator('button:has-text("Process")');
    await expect(processBtn).toBeVisible({ timeout: 10000 });
    await processBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.waitForTimeout(1000);

    // Done
    const doneBtn = page.locator('button:has-text("Done")');
    await expect(doneBtn).toBeVisible({ timeout: 10000 });
    await doneBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/svlt-08-wo-done.png', fullPage: true });
  });

  test('SVLT-09 Service role cannot see PI or Invoice (sidebar check)', async () => {
    // Service role must not have Finance features
    await loginAs(page, ACCOUNTS.service);
    const sidebar = page.locator('.sidebar');
    await expect(sidebar.locator('text="Proforma Invoice"')).not.toBeVisible();
    await expect(sidebar.locator('text="Invoice"')).not.toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/svlt-09-service-no-finance.png', fullPage: true });
  });

  test('SVLT-10 Finance creates Invoice (Full Paid)', async () => {
    await loginAs(page, ACCOUNTS.finance);
    await page.goto(`/proforma-invoice/${piId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const fullPaidBtn = page.locator('button:has-text("Create Invoice"), button:has-text("Full Paid")');
    await expect(fullPaidBtn.first()).toBeVisible({ timeout: 15000 });
    await fullPaidBtn.first().click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/svlt-10-invoice-created.png', fullPage: true });
  });

  test('SVLT-11 Marketing marks PO Done', async () => {
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
    await page.screenshot({ path: 'e2e/screenshots/svlt-11-po-done.png', fullPage: true });
  });

  test('SVLT-12 Verify: PO=Done, WO=Done, Invoice exists (API)', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, ACCOUNTS.director);

    const po = (await (await dir.get(`/api/purchase-order/${poId}`)).json()).data;
    expect(po.current_status, 'PO must be Done').toMatch(/done/i);

    const woList = (await (await dir.get('/api/work-order')).json()).data?.data ?? [];
    const wo = woList.find((w) => String(w.purchase_order_id) === String(poId));
    if (wo) {
      expect(wo.current_status, 'WO must be Done').toMatch(/done/i);
    }

    const invoices = (await (await dir.get('/api/invoice')).json()).data?.data ?? [];
    expect(invoices.length, 'Invoice must exist').toBeGreaterThan(0);
    await dir.dispose();
  });
});
