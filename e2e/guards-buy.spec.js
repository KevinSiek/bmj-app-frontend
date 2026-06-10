import { test, expect, request } from '@playwright/test';
import { provisionBuy } from './helpers.js';

/**
 * Negative-path & authz coverage for the BuyController write surface.
 *
 * The buy/* prefix is wrapped in role:inventory_purchase,inventory,director (routes/api.php),
 * so every mutation must reject forbidden roles with 403 — a hidden UI button proves nothing
 * about the API a determined client can call directly. Each authz block pairs the forbidden
 * role (→403) with an ALLOW-case asserting an authorized role does NOT get 403, to rule out a
 * blanket-deny false positive (mirrors SECW-008).
 *
 * Negative-path: approve/reject/needChange/done/destroy all load the row via
 * Buy::lockForUpdate()->find($id) and fall through to handleNotFound('Purchase not found')
 * when it's null, returning 404. The 404 is asserted with a guaranteed-nonexistent id
 * (999999) because that is exactly the documented trigger in the findings.
 *
 * API-direct only — no UI. Findings are from reading app/Http/Controllers/BuyController.php.
 */
test.describe('BuyController Guards — negative-path & authz', () => {
  let anon;

  // Guaranteed-nonexistent id: the findings' negativeTrigger is Buy::find($id) === null.
  const MISSING_ID = 999999;

  test.beforeAll(async ({ playwright }) => {
    anon = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Accept: 'application/json' },
    });
  });

  test.afterAll(async () => {
    await anon.dispose();
  });

  async function ctxFor(email, password = 'password') {
    const res = await anon.post('/api/login', { data: { email, password } });
    const body = await res.json();
    expect(body.access_token).toBeDefined();
    return request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}`, Accept: 'application/json' },
    });
  }

  // Self-provision a real buy id for ALLOW-cases that need a row that actually exists (so a
  // non-403 outcome reflects authz, not a 404). Reads the list first; if the seeders left it
  // empty, creates a buy via the same role. Returns a valid id (never null) so the allow-cases
  // run instead of skipping. Throws if provisioning fails, surfacing a setup break loudly.
  async function firstBuyId(api) {
    const res = await api.get('/api/buy');
    if (res.status() === 200) {
      const rows = (await res.json())?.data?.data ?? [];
      if (rows.length) return rows[0].id;
    }
    return provisionBuy(api);
  }

  // ---- POST /api/buy/approve/{id} ------------------------------------------------------

  test('GUARD-BUY-001: Marketing cannot POST buy/approve (Inventory/Director-only) → 403', async () => {
    const api = await ctxFor('citra.k@bmj.com'); // Marketing — not in role:inventory_purchase,inventory,director
    const res = await api.post(`/api/buy/approve/${MISSING_ID}`, { data: {} });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-BUY-002: Unauthenticated POST buy/approve → 401', async () => {
    const res = await anon.post(`/api/buy/approve/${MISSING_ID}`, { data: {} });
    expect(res.status()).toBe(401);
  });

  test('GUARD-BUY-003: approve with non-existent id → 404 (Buy::find returns null)', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized, so 404 is the body guard, not authz
    const res = await api.post(`/api/buy/approve/${MISSING_ID}`, { data: {} });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('GUARD-BUY-004: ALLOW — Inventory Purchase POST buy/approve is NOT 403', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
    const id = await firstBuyId(api);
    test.skip(id === null, 'No buy rows seeded to exercise the allow-case');
    const res = await api.post(`/api/buy/approve/${id}`, { data: {} });
    // The role IS authorized — whatever the outcome (200 success, or a status guard), it must NOT be 403/401.
    expect(res.status()).not.toBe(403);
    expect(res.status()).not.toBe(401);
    await api.dispose();
  });

  // ---- POST /api/buy/reject/{id}  (maps to decline()) ----------------------------------

  test('GUARD-BUY-005: Finance cannot POST buy/reject (Inventory/Director-only) → 403', async () => {
    const api = await ctxFor('fajar.n@bmj.com'); // Finance — not authorized for buy/*
    const res = await api.post(`/api/buy/reject/${MISSING_ID}`, { data: {} });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-BUY-006: reject with non-existent id → 404 (Buy::find returns null)', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
    const res = await api.post(`/api/buy/reject/${MISSING_ID}`, { data: {} });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('GUARD-BUY-007: ALLOW — Director POST buy/reject is NOT 403', async () => {
    const api = await ctxFor('director.jkt@bmj.com'); // Director — authorized
    const id = await firstBuyId(api);
    test.skip(id === null, 'No buy rows seeded to exercise the allow-case');
    const res = await api.post(`/api/buy/reject/${id}`, { data: {} });
    expect(res.status()).not.toBe(403);
    expect(res.status()).not.toBe(401);
    await api.dispose();
  });

  // ---- POST /api/buy/needChange/{id} ---------------------------------------------------

  test('GUARD-BUY-008: Marketing cannot POST buy/needChange (Inventory/Director-only) → 403', async () => {
    const api = await ctxFor('citra.k@bmj.com'); // Marketing — not authorized for buy/*
    const res = await api.post(`/api/buy/needChange/${MISSING_ID}`, { data: {} });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-BUY-009: needChange with non-existent id → 404 (Buy::find returns null)', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
    const res = await api.post(`/api/buy/needChange/${MISSING_ID}`, { data: {} });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('GUARD-BUY-010: ALLOW — Inventory Purchase POST buy/needChange is NOT 403', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
    const id = await firstBuyId(api);
    test.skip(id === null, 'No buy rows seeded to exercise the allow-case');
    const res = await api.post(`/api/buy/needChange/${id}`, { data: {} });
    expect(res.status()).not.toBe(403);
    expect(res.status()).not.toBe(401);
    await api.dispose();
  });

  // ---- POST /api/buy/done/{id} ---------------------------------------------------------

  test('GUARD-BUY-011: Service cannot POST buy/done (Inventory/Director-only) → 403', async () => {
    const api = await ctxFor('hadi.s@bmj.com'); // Service — not authorized for buy/*
    const res = await api.post(`/api/buy/done/${MISSING_ID}`, { data: {} });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-BUY-012: done with non-existent id → 404 (Buy::find returns null, before branch resolution)', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
    // find($id) === null returns 404 before ensureBuyBranchId() can throw — so this is a clean 404.
    const res = await api.post(`/api/buy/done/${MISSING_ID}`, { data: {} });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('GUARD-BUY-013: ALLOW — Director POST buy/done is NOT 403', async () => {
    const api = await ctxFor('director.jkt@bmj.com'); // Director — authorized
    const id = await firstBuyId(api);
    test.skip(id === null, 'No buy rows seeded to exercise the allow-case');
    const res = await api.post(`/api/buy/done/${id}`, { data: {} });
    // Authorized role: must not be 403/401. Note: done() can 500 via ensureBuyBranchId() if the
    // seeded buy has a null branch_id and a malformed buy_number (finding: line 684) — that is a
    // controller gap, not an authz failure, so we only assert it is not blocked by the role guard.
    expect(res.status()).not.toBe(403);
    expect(res.status()).not.toBe(401);
    await api.dispose();
  });

  // ---- DELETE /api/buy/{id} ------------------------------------------------------------

  test('GUARD-BUY-014: Finance cannot DELETE buy (Inventory/Director-only) → 403', async () => {
    const api = await ctxFor('fajar.n@bmj.com'); // Finance — not authorized for buy/*
    const res = await api.delete(`/api/buy/${MISSING_ID}`);
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-BUY-015: DELETE buy with non-existent id → 404 (Buy::find returns null)', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
    const res = await api.delete(`/api/buy/${MISSING_ID}`);
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // ALLOW-case for DELETE is intentionally a 404-not-403 probe, NOT a real deletion: destroy()
  // is destructive (removes detail_buys then the buy) and these guards must not mutate seed data.
  // A non-existent id still proves the role passes the guard (reaches the handler → 404, not 403).
  test('GUARD-BUY-016: ALLOW — Inventory Purchase DELETE buy reaches handler (404, not 403)', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
    const res = await api.delete(`/api/buy/${MISSING_ID}`);
    expect(res.status()).not.toBe(403);
    expect(res.status()).not.toBe(401);
    expect(res.status()).toBe(404);
    await api.dispose();
  });
});
