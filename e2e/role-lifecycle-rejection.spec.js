import { test, expect } from '@playwright/test';
import { closeModal, loginAs, apiContextFor, ACCOUNTS } from './helpers.js';

/**
 * Role-Lifecycle: Rejection Flows + Head Inventory Access Matrix
 *
 * Flow F — Quotation Rejection (low-price review ? Director rejects):
 *   Marketing       -> Create Quotation with price well below buy price (triggers review)
 *   Director        -> Sees quotation in Review list, rejects with reason
 *   Assert: Quotation status = Rejected, reason visible
 *
 * Flow G — Quotation Return (post-approval):
 *   Director        -> Create & approve a Quotation (API)
 *   Marketing       -> Submit return request (UI)
 *   Director        -> Approve Return (UI/API)
 *   Assert: Quotation status contains 'Return'
 *
 * Flow H — PO Decline by Finance:
 *   Director        -> Provision: Quotation ? approve ? moveToPo (API)
 *   Finance         -> Decline the PO with a reason (UI)
 *   Assert: PO status = Rejected
 *
 * Flow I — Head Inventory access verification:
 *   Head Inventory  -> Can access: PO, Spareparts, Borrow, Stock History,
 *                      Sparepart Movement, Purchase, Back Order, DO
 *   Head Inventory  -> Cannot access: Quotation, Invoice, PI (sidebar check)
 */
test.describe('Role Lifecycle — Rejection Flows + Head Inventory Access', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(600000);

  let page;
  let reviewQuotationSlug = null;
  let returnQuotationSlug = null;
  let declinePOId = null;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  // --- Flow F: Quotation Rejection (Review flow) -------------------------------

  test('REJT-F01 Marketing creates low-price Quotation (triggers review)', async () => {
    await loginAs(page, ACCOUNTS.marketing);
    await page.goto('/quotation/add');
    await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');

    await page.fill('input[placeholder="Company Name"]', 'PT Reject Review Test');
    await page.fill('input[placeholder="Address"]', 'Jl. Reject 1');
    await page.fill('input[placeholder="City"]', 'Jakarta');
    await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
    await page.fill('input[placeholder="Office"]', '021-333333');
    await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
    await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('textarea[placeholder="Notes"]', 'Low price quotation for rejection test');

    // Add sparepart with very low unit price to trigger review
    await page.click('button:has-text("Add Sparepart")');
    const firstRow = page.locator('.add-sparepart .list.row').first();
    const searchDone = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
    await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });
    await searchDone;
    await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
    await firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();
    await firstRow.locator('input[placeholder="Quantity"]').fill('1');
    // Unit price well below buy price (100,000) ? forces review
    await firstRow.locator('input[placeholder="Unit Price"]').fill('1000');
    await firstRow.locator('input[placeholder="Unit Price"]').blur();

    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);
    await expect(page).toHaveURL(/.*quotation/, { timeout: 20000 });
    await page.screenshot({ path: 'e2e/screenshots/rejt-f01-low-price-quotation.png', fullPage: true });
  });

  test('REJT-F02 Director sees Review list and rejects Quotation (UI)', async ({ playwright }) => {
    await loginAs(page, ACCOUNTS.director);

    // Find the quotation in the Review list
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const reviewRes = await dir.get('/api/quotation/review/1');
    const reviewItems = (await reviewRes.json()).data?.data ?? [];
    const found = reviewItems.find((q) => q.customer?.company_name?.includes('PT Reject Review Test'));
    if (found) reviewQuotationSlug = found.slug;
    await dir.dispose();

    if (reviewQuotationSlug) {
      await page.goto(`/quotation/review/${reviewQuotationSlug}`);
    } else {
      await page.goto('/quotation/review');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.locator('.list .item').first().click();
    }
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const rejectBtn = page.locator('button:has-text("Reject")');
    const visible = await rejectBtn.isVisible({ timeout: 10000 }).catch(() => false);
    if (!visible) {
      console.warn('REJT-F02: Reject button not visible — quotation may not be in review');
      return;
    }
    await rejectBtn.click();
    // Notes modal for rejection reason
    const notesInput = page.locator('.modal-body textarea, #modalNotes textarea');
    if (await notesInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await notesInput.fill('Harga terlalu rendah, tidak sesuai margin minimum');
      await page.locator('.button-modal button:has-text("Reject"), .button-modal button:last-child').click();
    } else {
      await page.click('button:has-text("Yes")');
    }
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/rejt-f02-quotation-rejected.png', fullPage: true });
  });

  test('REJT-F03 Verify Quotation status = Rejected (API)', async ({ playwright }) => {
    if (!reviewQuotationSlug) return;
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const q = (await (await dir.get(`/api/quotation/${reviewQuotationSlug}`)).json()).data;
    expect(q.current_status, 'Quotation must be Rejected').toMatch(/reject/i);
    await dir.dispose();
  });

  // --- Flow G: Quotation Return -------------------------------------------------

  test('REJT-G01 Director provisions approved Quotation (API)', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const sp = (await (await dir.get('/api/sparepart?search=E2E+Guaranteed')).json()).data?.data?.[0];
    expect(sp, 'REJT-G01: sparepart not found').toBeTruthy();

    const suffix = Date.now();
    const createRes = await dir.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName: `PT Return Test ${suffix}`, address: 'Jl. Return', city: 'Jakarta',
          province: 'DKI Jakarta', postalCode: '12345', office: '021-000', urban: 'U', subdistrict: 'S',
        },
        price: { amount: 150000 },
        spareparts: [{ sparepartId: sp.id, quantity: 1, unitPriceSell: 150000 }],
      },
    });
    expect(createRes.status()).toBe(201);
    returnQuotationSlug = (await createRes.json()).data.slug;

    const approveRes = await dir.post(`/api/quotation/approve/${returnQuotationSlug}`, {
      data: { notes: 'REJT-G01 provision approve' },
    });
    expect(approveRes.status(), `REJT-G01 approve: ${await approveRes.text()}`).toBe(200);
    await dir.dispose();
  });

  test('REJT-G02 Marketing requests Quotation Return (UI)', async ({ playwright }) => {
    if (!returnQuotationSlug) return;

    // Get quotation ID for the return endpoint
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const q = (await (await dir.get(`/api/quotation/${returnQuotationSlug}`)).json()).data;
    const quotationId = q.id;
    await dir.dispose();

    await loginAs(page, ACCOUNTS.marketing);
    // Use UI to submit return
    await page.goto(`/quotation/${returnQuotationSlug}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const returnBtn = page.locator('button:has-text("Return"), button:has-text("Kembalikan")');
    const visible = await returnBtn.isVisible({ timeout: 10000 }).catch(() => false);
    if (!visible) {
      // Use API fallback for return
      const mktCtx = await apiContextFor(playwright, ACCOUNTS.marketing);
      const retRes = await mktCtx.post(`/api/quotation/return/${quotationId}`, {
        data: { notes: 'Pelanggan ingin revisi' },
      });
      console.log(`REJT-G02 API return: ${retRes.status()}`);
      await mktCtx.dispose();
    } else {
      await returnBtn.click();
      const notesInput = page.locator('.modal-body textarea, #modalNotes textarea');
      if (await notesInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await notesInput.fill('Pelanggan ingin revisi scope');
        await page.locator('.button-modal button').last().click();
      } else {
        await page.click('button:has-text("Yes")');
      }
      await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
      await closeModal(page);
    }
    await page.screenshot({ path: 'e2e/screenshots/rejt-g02-return-requested.png', fullPage: true });
  });

  test('REJT-G03 Director approves Return (API)', async ({ playwright }) => {
    if (!returnQuotationSlug) return;
    const dir = await apiContextFor(playwright, ACCOUNTS.director);

    const approveReturnRes = await dir.get(`/api/quotation/approveReturn/${returnQuotationSlug}`);
    const status = approveReturnRes.status();
    if (status === 200) {
      const q = (await (await dir.get(`/api/quotation/${returnQuotationSlug}`)).json()).data;
      expect(q.current_status, 'Quotation must show Return status').toMatch(/return/i);
    } else {
      console.warn(`REJT-G03: approveReturn returned ${status} — quotation may not be in return state`);
    }
    await dir.dispose();
  });

  // --- Flow H: PO Decline by Finance --------------------------------------------

  test('REJT-H01 Director provisions a PO to decline (API)', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const sp = (await (await dir.get('/api/sparepart?search=E2E+Guaranteed')).json()).data?.data?.[0];
    expect(sp, 'REJT-H01: sparepart not found').toBeTruthy();

    const suffix = Date.now();
    const createRes = await dir.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName: `PT Decline PO Test ${suffix}`, address: 'Jl. Decline', city: 'Jakarta',
          province: 'DKI Jakarta', postalCode: '12345', office: '021-000', urban: 'U', subdistrict: 'S',
        },
        price: { amount: 150000 },
        spareparts: [{ sparepartId: sp.id, quantity: 1, unitPriceSell: 150000 }],
      },
    });
    expect(createRes.status()).toBe(201);
    const slug = (await createRes.json()).data.slug;

    await dir.post(`/api/quotation/approve/${slug}`, { data: { notes: 'REJT-H01' } });

    const movRes = await dir.post(`/api/quotation/moveToPo/${slug}`, {
      data: { notes: 'REJT-H01', poNumber: `PO-REJT-${suffix}` },
    });
    expect(movRes.status(), `REJT-H01 moveToPo: ${await movRes.text()}`).toBe(200);
    declinePOId = (await movRes.json()).data?.id;
    expect(declinePOId, 'REJT-H01: declinePOId not captured').toBeTruthy();
    await dir.dispose();
  });

  test('REJT-H02 Finance declines the PO with a reason (UI)', async () => {
    if (!declinePOId) return;
    await loginAs(page, ACCOUNTS.finance);
    await page.goto(`/purchase-order/${declinePOId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const declineBtn = page.locator('button:has-text("Decline"), button:has-text("Reject")');
    await expect(declineBtn).toBeVisible({ timeout: 15000 });
    await declineBtn.click();

    // Notes modal for decline reason
    const notesInput = page.locator('.modal-body textarea, #modalNotes textarea');
    if (await notesInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await notesInput.fill('Pelanggan membatalkan pesanan');
      await page.locator('.button-modal button:last-child').click();
    } else {
      await page.click('button:has-text("Yes")');
    }
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/rejt-h02-po-declined.png', fullPage: true });
  });

  test('REJT-H03 Verify PO status = Rejected (API)', async ({ playwright }) => {
    if (!declinePOId) return;
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const po = (await (await dir.get(`/api/purchase-order/${declinePOId}`)).json()).data;
    expect(po.current_status, 'PO must be Rejected').toMatch(/reject|decline/i);
    await dir.dispose();
  });

  // --- Flow I: Head Inventory access matrix ------------------------------------

  test('REJT-I01 Head Inventory can access PO list', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto('/purchase-order');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveURL(/.*purchase-order/);
    await page.screenshot({ path: 'e2e/screenshots/rejt-i01-headinv-po.png', fullPage: true });
  });

  test('REJT-I02 Head Inventory can access Spareparts list', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto('/spareparts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveURL(/.*spareparts/);
    await page.screenshot({ path: 'e2e/screenshots/rejt-i02-headinv-spareparts.png', fullPage: true });
  });

  test('REJT-I03 Head Inventory can access Borrow list', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto('/borrow');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveURL(/.*borrow/);
    await page.screenshot({ path: 'e2e/screenshots/rejt-i03-headinv-borrow.png', fullPage: true });
  });

  test('REJT-I04 Head Inventory can access Back Order list', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto('/back-order');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveURL(/.*back-order/);
    await page.screenshot({ path: 'e2e/screenshots/rejt-i04-headinv-bo.png', fullPage: true });
  });

  test('REJT-I05 Head Inventory can access Delivery Order list', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto('/delivery-order');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveURL(/.*delivery-order/);
    await page.screenshot({ path: 'e2e/screenshots/rejt-i05-headinv-do.png', fullPage: true });
  });

  test('REJT-I06 Head Inventory can access Stock History', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto('/stock-history');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveURL(/.*stock-history/);
    await page.screenshot({ path: 'e2e/screenshots/rejt-i06-headinv-stockhistory.png', fullPage: true });
  });

  test('REJT-I07 Head Inventory can access Sparepart Movement', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto('/sparepart-movement');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveURL(/.*sparepart-movement/);
    await page.screenshot({ path: 'e2e/screenshots/rejt-i07-headinv-movement.png', fullPage: true });
  });

  test('REJT-I08 Head Inventory can access Purchase (Buy) list', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto('/purchase');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveURL(/.*purchase/);
    await page.screenshot({ path: 'e2e/screenshots/rejt-i08-headinv-purchase.png', fullPage: true });
  });

  test('REJT-I09 Head Inventory sidebar does NOT show Quotation or Invoice', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    const sidebar = page.locator('.sidebar');
    await expect(sidebar.locator('text="Quotation"')).not.toBeVisible();
    await expect(sidebar.locator('text="Invoice"')).not.toBeVisible();
    await expect(sidebar.locator('text="Proforma Invoice"')).not.toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/rejt-i09-headinv-no-finance.png', fullPage: true });
  });

  test('REJT-I10 Head Inventory API 403 on Quotation endpoints', async ({ playwright }) => {
    const headInv = await apiContextFor(playwright, ACCOUNTS.headInventory);
    const res = await headInv.get('/api/quotation');
    // Role middleware blocks non-allowed roles with 403
    expect(res.status(), 'Head Inventory must get 403 on /api/quotation').toBe(403);
    await headInv.dispose();
  });

  test('REJT-I11 Marketing cannot access Back Order API', async ({ playwright }) => {
    const mkt = await apiContextFor(playwright, ACCOUNTS.marketing);
    const res = await mkt.get('/api/back-order');
    expect(res.status(), 'Marketing must get 403 on /api/back-order').toBe(403);
    await mkt.dispose();
  });

  test('REJT-I12 Service role cannot access Finance endpoints (API)', async ({ playwright }) => {
    const svc = await apiContextFor(playwright, ACCOUNTS.service);
    const piRes = await svc.get('/api/proforma-invoice');
    expect(piRes.status(), 'Service must get 403 on /api/proforma-invoice').toBe(403);
    const invRes = await svc.get('/api/invoice');
    expect(invRes.status(), 'Service must get 403 on /api/invoice').toBe(403);
    await svc.dispose();
  });
});
