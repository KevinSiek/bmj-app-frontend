import { test, expect } from '@playwright/test';
import { apiContextFor } from './helpers.js';

/**
 * Live runtime verification for the new Borrow (BOR) feature (Spec 1).
 * Drives the API as Director (implicit role bypass) to prove exact stock deltas across the
 * Created -> Borrowed -> Returned / Cancelled lifecycle and the insufficient-stock 422 block,
 * then screenshots the new UI pages.
 *
 * Run:  npx playwright test --config=playwright.verify.config.js feature-verify-borrow.spec.js
 */
test.describe('Borrow (BOR) — runtime verification', () => {
  test.describe.configure({ mode: 'serial' });

  const minted = { borrowId: null, cancelId: null, sparepartId: null, branchStockBefore: null };
  const QTY = 3;

  // Find a sparepart that has >= QTY stock in the Director's (Jakarta) branch.
  async function findStockedSparepart(dir) {
    const list = (await (await dir.get('/api/sparepart')).json()).data.data;
    for (const sp of list) {
      // sparepart detail/list carries per-branch stock; find Jakarta stock >= QTY
      const stocks = sp.total_unit ?? sp.stocks ?? sp.branch_stocks ?? [];
      const jkt = (Array.isArray(stocks) ? stocks : []).find(
        (s) => (s.name ?? s.branch ?? '').toLowerCase().includes('jakarta'));
      if (jkt && Number(jkt.stock ?? jkt.quantity ?? 0) >= QTY) {
        return { id: sp.id, stock: Number(jkt.stock ?? jkt.quantity) };
      }
    }
    return null;
  }

  // Read a sparepart's Jakarta stock via its detail endpoint.
  async function jakartaStock(dir, sparepartId) {
    const d = (await (await dir.get(`/api/sparepart/${sparepartId}`)).json()).data;
    const stocks = d.total_unit ?? d.stocks ?? d.branch_stocks ?? [];
    const jkt = (Array.isArray(stocks) ? stocks : []).find(
      (s) => (s.name ?? s.branch ?? '').toLowerCase().includes('jakarta'));
    return Number(jkt?.stock ?? jkt?.quantity ?? 0);
  }

  test('BOR-1: create -> borrow decrements stock by qty, return restores it', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');

    const sp = await findStockedSparepart(dir);
    expect(sp, 'no sparepart with enough Jakarta stock found').toBeTruthy();
    minted.sparepartId = sp.id;

    const before = await jakartaStock(dir, sp.id);

    // create (Created — no stock effect)
    const create = await dir.post('/api/borrow', {
      data: { borrowerName: 'Runtime Tester', notes: 'verify', spareparts: [{ sparepartId: sp.id, quantity: QTY }] },
    });
    expect(create.status(), `create: ${await create.text()}`).toBe(201);
    minted.borrowId = (await create.json()).data.id;

    const afterCreate = await jakartaStock(dir, sp.id);
    expect(afterCreate, 'Created must NOT change stock').toBe(before);

    // borrow (decrement)
    const borrow = await dir.post(`/api/borrow/borrow/${minted.borrowId}`, { data: {} });
    expect(borrow.status(), `borrow: ${await borrow.text()}`).toBe(200);
    const afterBorrow = await jakartaStock(dir, sp.id);
    expect(afterBorrow, 'Borrowed must decrement by qty').toBe(before - QTY);

    // return (restore)
    const ret = await dir.post(`/api/borrow/return/${minted.borrowId}`, { data: {} });
    expect(ret.status(), `return: ${await ret.text()}`).toBe(200);
    const afterReturn = await jakartaStock(dir, sp.id);
    expect(afterReturn, 'Returned must restore stock').toBe(before);

    // status is Returned
    const got = (await (await dir.get(`/api/borrow/${minted.borrowId}`)).json()).data;
    expect(got.current_status).toBe('Returned');
    await dir.dispose();
  });

  test('BOR-2: cancel-from-Borrowed reverses the decrement', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');
    const before = await jakartaStock(dir, minted.sparepartId);

    const create = await dir.post('/api/borrow', {
      data: { borrowerName: 'Cancel Tester', spareparts: [{ sparepartId: minted.sparepartId, quantity: QTY }] },
    });
    expect(create.status()).toBe(201);
    minted.cancelId = (await create.json()).data.id;

    await dir.post(`/api/borrow/borrow/${minted.cancelId}`, { data: {} });
    expect(await jakartaStock(dir, minted.sparepartId)).toBe(before - QTY);

    const cancel = await dir.post(`/api/borrow/cancel/${minted.cancelId}`, { data: {} });
    expect(cancel.status(), `cancel: ${await cancel.text()}`).toBe(200);
    expect(await jakartaStock(dir, minted.sparepartId), 'cancel-from-Borrowed restores stock').toBe(before);

    const got = (await (await dir.get(`/api/borrow/${minted.cancelId}`)).json()).data;
    expect(got.current_status).toBe('Cancelled');
    await dir.dispose();
  });

  test('BOR-3: borrow blocked (422) when branch stock is insufficient; stock untouched', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');
    const before = await jakartaStock(dir, minted.sparepartId);

    // Ask for an absurd quantity that exceeds stock.
    const hugeQty = before + 1_000_000;
    const create = await dir.post('/api/borrow', {
      data: { borrowerName: 'Over Borrow', spareparts: [{ sparepartId: minted.sparepartId, quantity: hugeQty }] },
    });
    expect(create.status()).toBe(201);
    const id = (await create.json()).data.id;

    const borrow = await dir.post(`/api/borrow/borrow/${id}`, { data: {} });
    expect(borrow.status(), 'over-borrow must be 422').toBe(422);
    // stock NOT touched
    expect(await jakartaStock(dir, minted.sparepartId), 'failed borrow must not change stock').toBe(before);
    // status still Created
    const got = (await (await dir.get(`/api/borrow/${id}`)).json()).data;
    expect(got.current_status).toBe('Created');
    await dir.dispose();
  });

  test('BOR-4: illegal transition guarded (return from Created -> 400)', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');
    const create = await dir.post('/api/borrow', {
      data: { borrowerName: 'Guard', spareparts: [{ sparepartId: minted.sparepartId, quantity: 1 }] },
    });
    const id = (await create.json()).data.id;
    const ret = await dir.post(`/api/borrow/return/${id}`, { data: {} });
    expect(ret.status(), 'return-from-Created must be 400').toBe(400);
    await dir.dispose();
  });

  test('BOR-5 UI: Borrow list + detail render with status-gated buttons', async ({ page }) => {
    test.skip(!minted.borrowId, 'no borrow minted');
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/borrow');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/borrow-list.png', fullPage: true });

    await page.goto(`/borrow/${minted.borrowId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    // Borrower name + status render in disabled inputs (BMJ detail-page convention). Vue binds
    // value as a property, not an HTML attribute, so assert with toHaveValue on the named textbox.
    await expect(page.getByRole('textbox', { name: 'Borrower' })).toHaveValue('Runtime Tester', { timeout: 8000 });
    await expect(page.getByRole('textbox', { name: 'Status' })).toHaveValue('Returned', { timeout: 8000 });
    await page.screenshot({ path: 'e2e/screenshots/borrow-detail.png', fullPage: true });
  });

  test('BOR-6 UI: Add Borrow form renders', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/borrow/add');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/borrow-add.png', fullPage: true });
  });
});
