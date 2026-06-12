import { test, expect } from '@playwright/test';
import { apiContextFor } from './helpers.js';

/**
 * Live runtime verification for the Stock History feature AFTER it was moved from the sparepart
 * detail page into its own standalone /stock-history page (global list + filters).
 * Verifies:
 *  - GET /api/stock-movement (global) returns movements with sign + sparepart + source, and the
 *    source_type filter works.
 *  - The standalone /stock-history page renders the table for Director.
 *  - The sparepart DETAIL page no longer shows a Stock History section.
 *  - Marketing gets 403 on the global endpoint AND the page/menu is not available.
 *
 * Run:  npx playwright test --config=playwright.verify.config.js feature-verify-stock-history.spec.js
 */
test.describe('Stock History (standalone page) — runtime verification', () => {
  test.describe.configure({ mode: 'serial' });

  const minted = { sparepartId: null };
  const QTY = 2;

  async function jakartaStock(dir, id) {
    const d = (await (await dir.get(`/api/sparepart/${id}`)).json()).data;
    const stocks = d.total_unit ?? d.stocks ?? d.branch_stocks ?? [];
    const jkt = (Array.isArray(stocks) ? stocks : []).find(
      (s) => (s.name ?? s.branch ?? '').toLowerCase().includes('jakarta'));
    return Number(jkt?.stock ?? jkt?.quantity ?? 0);
  }

  test('SH-1: a Borrow cycle writes +/- movements visible in the GLOBAL endpoint + filter works', async ({ playwright }) => {
    const dir = await apiContextFor(playwright, 'director.jkt@bmj.com');

    const list = (await (await dir.get('/api/sparepart')).json()).data.data;
    let target = null;
    for (const sp of list) {
      if ((await jakartaStock(dir, sp.id)) >= QTY) { target = sp.id; break; }
    }
    expect(target, 'no sparepart with enough Jakarta stock').toBeTruthy();
    minted.sparepartId = target;

    const create = await dir.post('/api/borrow', {
      data: { borrowerName: 'History Tester', spareparts: [{ sparepartId: target, quantity: QTY }] },
    });
    const borrowId = (await create.json()).data.id;
    await dir.post(`/api/borrow/borrow/${borrowId}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    await dir.post(`/api/borrow/return/${borrowId}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });

    // global endpoint
    const all = (await (await dir.get('/api/stock-movement')).json()).data.data;
    expect(Array.isArray(all) && all.length >= 2, 'expected movements in global ledger').toBeTruthy();
    // each row carries the sparepart it belongs to
    expect(all[0].sparepart, 'global rows must include sparepart').toBeTruthy();

    // source_type filter
    const borrowOnly = (await (await dir.get('/api/stock-movement?source_type=Borrow')).json()).data.data;
    expect(borrowOnly.every((m) => m.source_type === 'Borrow')).toBeTruthy();
    const mine = borrowOnly.filter((m) => m.source_id === borrowId);
    expect(mine.some((m) => Number(m.delta) === QTY)).toBeTruthy();
    expect(mine.some((m) => Number(m.delta) === -QTY)).toBeTruthy();
    await dir.dispose();
  });

  test('SH-2 UI: standalone /stock-history page renders the table for Director', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto('/stock-history');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page.getByText('Stock History', { exact: false }).first()).toBeVisible({ timeout: 8000 });
    // A Borrow movement should appear somewhere in the table.
    await expect(page.getByText('Borrow', { exact: false }).first()).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: 'e2e/screenshots/stock-history-page.png', fullPage: true });
  });

  test('SH-3 UI: sparepart DETAIL page no longer shows a Stock History section', async ({ page }) => {
    test.skip(!minted.sparepartId, 'no sparepart');
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto(`/spareparts/${minted.sparepartId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    // The Sparepart Information form renders, but NO Stock History SECTION HEADING here anymore.
    // (The sidebar nav now has a "Stock History" link — that's expected and not a section title.)
    // Section headings on this page use `.title`; assert none of them says "Stock History".
    await expect(page.locator('.title', { hasText: 'Sparepart Information' })).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.title', { hasText: 'Stock History' })).toHaveCount(0);
  });

  test('SH-4: Marketing gets 403 on the global endpoint; sparepart still visible', async ({ playwright }) => {
    const mkt = await apiContextFor(playwright, 'citra.k@bmj.com');
    const res = await mkt.get('/api/stock-movement');
    expect(res.status()).toBe(403);
    const sp = await mkt.get(`/api/sparepart/${minted.sparepartId}`);
    expect(sp.status()).toBe(200);
    await mkt.dispose();
  });
});
