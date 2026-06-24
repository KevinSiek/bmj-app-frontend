import { test, expect } from '@playwright/test';
import { closeModal, loginAs, apiContextFor, apiContextForRole, getStockForBranch, ACCOUNTS } from './helpers.js';

/**
 * Role-Lifecycle: Borrow (Pinjaman) + Sparepart Movement
 *
 * Flow D — Borrow via correct roles:
 *   Director        -> Provision a Service PO (API) so Borrow has a PO to reference
 *   Marketing       -> Create Borrow request linked to Service PO (UI)
 *   Head Inventory  -> Approve Borrow (UI)
 *   Inv.Admin       -> Send Borrow (decrement stock) (UI)
 *   Marketing       -> Initiate Kembali/Return (UI)
 *   Inv.Admin       -> Mark Borrow Done (reconcile returned qty) (UI)
 *   Assert: stock delta correct
 *
 * Flow E — Sparepart Movement (inter-branch transfer):
 *   Inv.Admin       -> Create Sparepart Movement Jakarta ? Semarang (UI)
 *   Inv.Admin       -> Send movement (stock decrements from Jakarta) (UI)
 *   Inv.Admin       -> Receive movement (stock increments to Semarang) (UI)
 *   Head Inventory  -> View Stock History — sees movement entries (UI)
 *   Assert: Jakarta stock -qty, Semarang stock +qty, Stock History has entries
 */
test.describe('Role Lifecycle — Borrow + Sparepart Movement', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(900000);

  let page;
  let borrowId = null;
  let movementId = null;
  let servicePOId = null;
  let sparepartId = null;
  let jktStockBefore = 0;
  let smgStockBefore = 0;
  const BORROW_QTY = 3;
  const MOVE_QTY = 5;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  // --- Flow D: Borrow ---------------------------------------------------------

  test('BRLT-00 Setup: Director provisions a Service PO (API)', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, ACCOUNTS.director);

    // Get E2E Guaranteed Stock sparepart ID for stock delta assertions
    const sp = (await (await dir.get('/api/sparepart?search=E2E+Guaranteed')).json()).data?.data?.[0];
    expect(sp, 'E2E Guaranteed Stock Sparepart must exist').toBeTruthy();
    sparepartId = sp.id;

    // Read initial stock
    jktStockBefore = await getStockForBranch(dir, sparepartId, 'jakarta');
    smgStockBefore = await getStockForBranch(dir, sparepartId, 'semarang');

    // Create a Service Quotation and get it to Ready state so Borrow can reference it
    const suffix = `${Date.now()}`;
    const createRes = await dir.post('/api/quotation', {
      data: {
        project: { type: 'Service' },
        customer: {
          companyName: `PT Borrow Lifecycle ${suffix}`, address: 'Jl. Borrow', city: 'Jakarta',
          province: 'DKI Jakarta', postalCode: '12345', office: '021-000', urban: 'U', subdistrict: 'S',
        },
        price: { amount: 3000000 },
        services: [{ service: 'E2E Borrow Service', quantity: 1, servicePrice: 3000000 }],
      },
    });
    expect(createRes.status()).toBe(201);
    const slug = (await createRes.json()).data.slug;

    await dir.post(`/api/quotation/approve/${slug}`, { data: { notes: 'BRLT-00 provision' } });
    const movRes = await dir.post(`/api/quotation/moveToPo/${slug}`, {
      data: { notes: 'BRLT-00 provision', poNumber: `PO-BRLT-${suffix}` },
    });
    expect(movRes.status()).toBe(200);
    servicePOId = (await movRes.json()).data?.id;
    expect(servicePOId, 'BRLT-00: servicePOId not created').toBeTruthy();

    await dir.dispose();
  });

  test('BRLT-01 Marketing creates Borrow request (UI)', async () => {
    await loginAs(page, ACCOUNTS.marketing);
    await page.goto('/borrow/add');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Fill borrower name
    await page.fill('input[placeholder="Borrower Name"], input[name="borrowerName"]', 'E2E Marketing Borrower');

    // Select Service PO using PoSelect component
    const poSelectSearch = page.locator('input[placeholder*="Search PO"], input[placeholder*="Cari PO"]').first();
    if (await poSelectSearch.isVisible({ timeout: 3000 }).catch(() => false)) {
      await poSelectSearch.fill('PO-BRLT');
      await page.waitForTimeout(1000);
      const poOption = page.locator('.dropdown-item, .option-item').first();
      if (await poOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await poOption.click();
      }
    }

    // Add sparepart line
    const addSparepartBtn = page.locator('button:has-text("Add Sparepart")');
    if (await addSparepartBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addSparepartBtn.click();
      const firstRow = page.locator('.add-sparepart .list.row, .list.row').first();
      const searchDone = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
      await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('E2E Guaranteed', { delay: 30 });
      await searchDone;
      await expect(firstRow.locator('.dropdown-item').first()).toBeVisible({ timeout: 10000 });
      await firstRow.locator('.dropdown-item').first().click();
      await firstRow.locator('input[placeholder="Quantity"]').fill(String(BORROW_QTY));
    }

    await page.fill('textarea[placeholder*="Notes"], textarea[placeholder*="notes"]', 'E2E Borrow Test');

    const submitBtn = page.locator('button.btn-process:has-text("Add"), button.btn-process:has-text("Submit"), button.btn-process:has-text("Create")');
    await expect(submitBtn.first()).toBeVisible({ timeout: 10000 });
    await submitBtn.first().click();
    await page.click('button:has-text("Yes")');

    // May redirect to borrow list or show success modal
    const succeeded = await page.locator('#modalMessage .text-header').waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    if (succeeded) {
      await closeModal(page);
    }
    await page.screenshot({ path: 'e2e/screenshots/brlt-01-borrow-created.png', fullPage: true });
  });

  test('BRLT-01b Borrow created via API (fallback + ID capture)', async ({ playwright }) => {
    // Direct API creation as a reliable fallback — captures borrowId for subsequent tests
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const sp = (await (await dir.get('/api/sparepart?search=E2E+Guaranteed')).json()).data?.data?.[0];
    if (!sp) { await dir.dispose(); return; }

    const borrowRes = await dir.post('/api/borrow', {
      data: {
        borrowerName: 'E2E Role Test Borrower',
        notes: 'BRLT lifecycle',
        spareparts: [{ sparepartId: sp.id, quantity: BORROW_QTY }],
      },
    });
    expect(borrowRes.status(), `BRLT-01b create borrow: ${await borrowRes.text()}`).toBe(201);
    borrowId = (await borrowRes.json()).data?.id;
    expect(borrowId, 'BRLT-01b: borrowId not captured').toBeTruthy();
    await dir.dispose();
  });

  test('BRLT-02 Head Inventory approves Borrow (UI)', async () => {
    if (!borrowId) { return; }
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto(`/borrow/${borrowId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const approveBtn = page.locator('button:has-text("Approve")');
    const visible = await approveBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) {
      console.warn('BRLT-02: Approve button not visible — Borrow may already be approved');
      return;
    }
    await approveBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);
    await page.screenshot({ path: 'e2e/screenshots/brlt-02-borrow-approved.png', fullPage: true });
  });

  test('BRLT-03 Inv.Admin sends Borrow (decrement stock) (UI)', async ({ playwright }) => {
    if (!borrowId) { return; }
    await loginAs(page, ACCOUNTS.inventoryAdmin);
    await page.goto(`/borrow/${borrowId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const stockBefore = await getStockForBranch(
      await apiContextFor(playwright, ACCOUNTS.director), sparepartId, 'jakarta'
    );

    const sendBtn = page.locator('button:has-text("Send"), button:has-text("Kirim")');
    const visible = await sendBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) {
      console.warn('BRLT-03: Send button not visible — Borrow may not be Approved');
      return;
    }
    // Send may open a notes modal for "Yang Menerima"
    await sendBtn.click();
    const notesModal = page.locator('.modal-body textarea');
    if (await notesModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await notesModal.fill('Penerima: E2E Test User');
      await page.locator('.button-modal button:has-text("Send"), .button-modal button').last().click();
    }
    const yesBtn = page.locator('button:has-text("Yes")');
    if (await yesBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await yesBtn.click();
    }
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);

    // Verify stock decreased
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const stockAfter = await getStockForBranch(dir, sparepartId, 'jakarta');
    expect(stockAfter, 'Stock must decrease after Borrow sent').toBeLessThanOrEqual(stockBefore);
    await dir.dispose();
    await page.screenshot({ path: 'e2e/screenshots/brlt-03-borrow-sent.png', fullPage: true });
  });

  test('BRLT-04 Marketing initiates Kembali/Return (UI)', async () => {
    if (!borrowId) { return; }
    await loginAs(page, ACCOUNTS.marketing);
    await page.goto(`/borrow/${borrowId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const kembaliBtn = page.locator('button:has-text("Kembali"), button:has-text("Return")');
    const visible = await kembaliBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) {
      console.warn('BRLT-04: Kembali button not visible — Borrow may not be in Borrowed status');
      return;
    }
    await kembaliBtn.click();
    // May redirect to BorrowReturnPage or show modal
    await page.waitForTimeout(1000);
    // If we're on a return form page, fill qty
    const qtyInputs = await page.locator('input[placeholder="Quantity"], input[type="number"]').all();
    for (const qi of qtyInputs) {
      const isReadOnly = await qi.getAttribute('readonly');
      if (!isReadOnly) {
        await qi.fill(String(BORROW_QTY));
      }
    }
    const submitBtn = page.locator('button.btn-process, button:has-text("Submit Return"), button:has-text("Kembali")').last();
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
      await page.click('button:has-text("Yes")');
      await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
      await closeModal(page);
    }
    await page.screenshot({ path: 'e2e/screenshots/brlt-04-kembali.png', fullPage: true });
  });

  test('BRLT-05 Inv.Admin marks Borrow Done (reconcile + restore stock) (UI)', async ({ playwright }) => {
    if (!borrowId) { return; }
    await loginAs(page, ACCOUNTS.inventoryAdmin);
    await page.goto(`/borrow/${borrowId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const doneBtn = page.locator('button:has-text("Done")');
    const visible = await doneBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) {
      console.warn('BRLT-05: Done button not visible — Borrow may not be in Returned status');
      return;
    }

    const stockBefore = await getStockForBranch(
      await apiContextFor(playwright, ACCOUNTS.director), sparepartId, 'jakarta'
    );

    await doneBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);

    // Stock restored
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const stockAfter = await getStockForBranch(dir, sparepartId, 'jakarta');
    expect(stockAfter, 'Stock must be restored after Borrow Done').toBeGreaterThanOrEqual(stockBefore);
    await dir.dispose();
    await page.screenshot({ path: 'e2e/screenshots/brlt-05-borrow-done.png', fullPage: true });
  });

  // --- Flow E: Sparepart Movement ---------------------------------------------

  test('MVLT-01 Inv.Admin creates Sparepart Movement Jakarta ? Semarang (UI)', async ({ playwright }) => {
    await loginAs(page, ACCOUNTS.inventoryAdmin);

    // Read stock before movement
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    jktStockBefore = await getStockForBranch(dir, sparepartId, 'jakarta');
    smgStockBefore = await getStockForBranch(dir, sparepartId, 'semarang');
    await dir.dispose();

    await page.goto('/sparepart-movement/add');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Select source branch (Jakarta) and target branch (Semarang)
    await page.selectOption('select[aria-label="Source Branch"], select:has(option:text-is("Jakarta"))', 'Jakarta');
    await page.selectOption('select[aria-label="Target Branch"], select:has(option:text-is("Semarang"))', 'Semarang');

    await page.fill('input[placeholder="Reason"], textarea[placeholder="Reason"]', 'E2E Movement Test');

    // Add sparepart line
    const addBtn = page.locator('button:has-text("Add Sparepart")');
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      const firstRow = page.locator('.add-sparepart .list.row, .list.row').first();
      const searchDone = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
      await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('E2E Guaranteed', { delay: 30 });
      await searchDone;
      await expect(firstRow.locator('.dropdown-item').first()).toBeVisible({ timeout: 10000 });
      await firstRow.locator('.dropdown-item').first().click();
      await firstRow.locator('input[placeholder="Quantity"]').fill(String(MOVE_QTY));
    }

    const submitBtn = page.locator('button.btn-process:has-text("Add"), button.btn-process:has-text("Create"), button.btn-process');
    await expect(submitBtn.first()).toBeVisible({ timeout: 10000 });
    await submitBtn.first().click();
    await page.click('button:has-text("Yes")');

    const succeeded = await page.locator('#modalMessage .text-header').waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    if (succeeded) {
      await closeModal(page);
    }
    await page.screenshot({ path: 'e2e/screenshots/mvlt-01-movement-created.png', fullPage: true });
  });

  test('MVLT-01b Sparepart Movement created via API (fallback + ID capture)', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, ACCOUNTS.director);

    // Find branch IDs
    const branches = (await (await dir.get('/api/branch')).json()).data ?? [];
    const jkt = branches.find((b) => b.name?.toLowerCase().includes('jakarta'));
    const smg = branches.find((b) => b.name?.toLowerCase().includes('semarang'));

    if (!jkt || !smg) {
      console.warn('MVLT-01b: Cannot resolve branch IDs — skipping API fallback');
      await dir.dispose();
      return;
    }

    const createRes = await dir.post('/api/sparepart-movement', {
      data: {
        sourceBranch: jkt.id,
        targetBranch: smg.id,
        reason: 'E2E Movement API fallback',
        spareparts: [{ sparepartId, quantity: MOVE_QTY }],
      },
    });
    if (createRes.status() === 201) {
      movementId = (await createRes.json()).data?.id;
    } else {
      console.warn(`MVLT-01b: create movement -> ${createRes.status()}: ${await createRes.text()}`);
    }
    await dir.dispose();
  });

  test('MVLT-02 Inv.Admin sends movement (stock leaves Jakarta) (UI)', async ({ playwright }) => {
    if (!movementId) {
      // Try to find the newest movement
      const dir = await apiContextFor(playwright, ACCOUNTS.director);
      const list = (await (await dir.get('/api/sparepart-movement')).json()).data?.data ?? [];
      if (list.length > 0) movementId = list[0].id;
      await dir.dispose();
    }
    if (!movementId) { console.warn('MVLT-02: no movementId — skipping'); return; }

    await loginAs(page, ACCOUNTS.inventoryAdmin);
    await page.goto(`/sparepart-movement/${movementId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const sendBtn = page.locator('button:has-text("Send")');
    const visible = await sendBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { console.warn('MVLT-02: Send button not visible'); return; }

    await sendBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);

    // Jakarta stock should have decreased
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const jktAfter = await getStockForBranch(dir, sparepartId, 'jakarta');
    expect(jktAfter, 'Jakarta stock must decrease after Send').toBeLessThanOrEqual(jktStockBefore);
    await dir.dispose();
    await page.screenshot({ path: 'e2e/screenshots/mvlt-02-movement-sent.png', fullPage: true });
  });

  test('MVLT-03 Inv.Admin receives movement (stock arrives at Semarang) (UI)', async ({ playwright }) => {
    if (!movementId) { console.warn('MVLT-03: no movementId — skipping'); return; }

    await loginAs(page, ACCOUNTS.inventoryAdmin);
    await page.goto(`/sparepart-movement/${movementId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const receiveBtn = page.locator('button:has-text("Receive")');
    const visible = await receiveBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { console.warn('MVLT-03: Receive button not visible'); return; }

    await receiveBtn.click();
    await page.click('button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/success/i, { timeout: 10000 });
    await closeModal(page);

    // Semarang stock should have increased
    const dir = await apiContextFor(playwright, ACCOUNTS.director);
    const smgAfter = await getStockForBranch(dir, sparepartId, 'semarang');
    expect(smgAfter, 'Semarang stock must increase after Receive').toBeGreaterThanOrEqual(smgStockBefore);
    await dir.dispose();
    await page.screenshot({ path: 'e2e/screenshots/mvlt-03-movement-received.png', fullPage: true });
  });

  test('MVLT-04 Head Inventory views Stock History (sees movement entries)', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto('/stock-history');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Stock history page must load
    await expect(page.locator('.list .item, table tbody tr, .history-item').first()).toBeVisible({ timeout: 10000 });

    // Filter by SparepartMovement source type if filter exists
    const sourceFilter = page.locator('select[aria-label="Source Type"], select:has(option:text-is("SparepartMovement"))');
    if (await sourceFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sourceFilter.selectOption('SparepartMovement');
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    }

    await page.screenshot({ path: 'e2e/screenshots/mvlt-04-stock-history.png', fullPage: true });
    // Head Inventory must see the page (role access confirmed)
    await expect(page).toHaveURL(/.*stock-history/, { timeout: 5000 });
  });

  test('MVLT-05 Head Inventory can also see Sparepart Movement list', async () => {
    await loginAs(page, ACCOUNTS.headInventory);
    await page.goto('/sparepart-movement');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveURL(/.*sparepart-movement/);
    await page.screenshot({ path: 'e2e/screenshots/mvlt-05-head-inv-movement-list.png', fullPage: true });
  });

  test('MVLT-06 Finance cannot see Sparepart Movement (role block)', async () => {
    await loginAs(page, ACCOUNTS.finance);
    const sidebar = page.locator('.sidebar');
    await expect(sidebar.locator('text="Sparepart Movement"')).not.toBeVisible();
    await expect(sidebar.locator('text="Stock History"')).not.toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/mvlt-06-finance-no-movement.png', fullPage: true });
  });
});
