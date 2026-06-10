import { test, expect, request } from '@playwright/test';
import { provisionQuotationAndPo } from './helpers.js';

/**
 * Guard suite — High-Risk Endpoints (delivery-order, back-order, proforma-invoice).
 *
 * Closes negative-path + authz gaps on three state-mutating "process/pay" endpoints. A
 * hidden UI button proves nothing about the API a determined client can call directly, so
 * every assertion here hits the API directly with a real Bearer token.
 *
 * AUTHZ: a forbidden role must get 403 (or 401 unauthenticated). Each authz group is paired
 * with an ALLOW-case proving an authorized role does NOT get 403 — that rules out a
 * blanket-deny false positive (the role IS allowed; whatever business/404 outcome follows
 * is fine, just not 403).
 *
 * NEGATIVE: the exact rejected status comes from reading the controllers:
 *   - DeliveryOrderController::process — current_status === 'Done'  → 400 (HTTP_BAD_REQUEST)
 *   - BackOrderController::process     — current_status in [Ready, Rejected] → 400
 *   - ProformaInvoiceController::fullPaid — PO current_status === 'Rejected' → 400
 * None of these endpoints run $request->validate, so 422 is not reachable; the only
 * negative is the business-rule 400. Each negative test self-provisions a real {id}/{po_id}
 * in the required state from the authorized-role list endpoint, and test.skip's with a
 * reason when the seeded data has no row in that state (never hardcodes id 1 for a
 * negative-status assertion).
 */
test.describe('Guards: High-Risk Endpoints (delivery-order, back-order, proforma-invoice)', () => {
  let anon;

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

  // Pull the paginated item list (data.data envelope) from a list endpoint.
  async function listItems(api, path) {
    const res = await api.get(path);
    if (res.status() !== 200) return [];
    const body = await res.json();
    return body?.data?.data ?? [];
  }

  // ---------------------------------------------------------------------------
  // delivery-order/process — route middleware: inventory_admin, inventory, director
  // ---------------------------------------------------------------------------

  test('GUARD-HRE-001: Marketing POST delivery-order/process (inventory/director-only) → 403', async () => {
    const api = await ctxFor('citra.k@bmj.com'); // Marketing — forbidden by route middleware
    const res = await api.post('/api/delivery-order/process/1', { data: {} });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-HRE-002: Unauthenticated POST delivery-order/process → 401', async () => {
    const res = await anon.post('/api/delivery-order/process/1', { data: {} });
    expect(res.status()).toBe(401);
  });

  test('GUARD-HRE-003: ALLOW-case — Inventory Admin POST delivery-order/process is NOT 403', async () => {
    const api = await ctxFor('eko.p@bmj.com'); // Inventory Admin — authorized
    const items = await listItems(api, '/api/delivery-order');
    if (items.length === 0) {
      test.skip(true, 'No seeded delivery orders to exercise the authorized path');
    }
    const res = await api.post(`/api/delivery-order/process/${items[0].id}`, { data: {} });
    // Role IS authorized — outcome may be 200 (processed) or 400 (already Done), never 403.
    expect(res.status()).not.toBe(403);
    await api.dispose();
  });

  test('GUARD-HRE-004: Inventory Admin POST delivery-order/process on an already-Done order → 400', async () => {
    const api = await ctxFor('eko.p@bmj.com'); // Inventory Admin — authorized
    const items = await listItems(api, '/api/delivery-order');
    const done = items.find((d) => d.current_status === 'Done');
    if (!done) {
      test.skip(true, "No seeded delivery order in 'Done' status to trigger the business-rule 400");
    }
    const res = await api.post(`/api/delivery-order/process/${done.id}`, { data: {} });
    expect(res.status()).toBe(400); // controller: current_status === 'Done' → HTTP_BAD_REQUEST
    await api.dispose();
  });

  test('GUARD-HRE-005: Inventory Admin POST delivery-order/process on nonexistent id → 404', async () => {
    const api = await ctxFor('eko.p@bmj.com'); // Inventory Admin — authorized
    const res = await api.post('/api/delivery-order/process/999999', { data: {} });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // back-order/process — route middleware: inventory_purchase, inventory_admin, inventory,
  // director; PLUS in-controller role check ['Director','Inventory Purchase','Inventory Admin'].
  // Marketing fails the route middleware (allows none of marketing) → 403.
  // ---------------------------------------------------------------------------

  test('GUARD-HRE-006: Marketing POST back-order/process → 403', async () => {
    const api = await ctxFor('citra.k@bmj.com'); // Marketing — forbidden by route middleware
    const res = await api.post('/api/back-order/process/1', { data: {} });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-HRE-007: Unauthenticated POST back-order/process → 401', async () => {
    const res = await anon.post('/api/back-order/process/1', { data: {} });
    expect(res.status()).toBe(401);
  });

  test('GUARD-HRE-008: ALLOW-case — Inventory Purchase POST back-order/process is NOT 403', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized (route + in-controller)
    const items = await listItems(api, '/api/back-order');
    if (items.length === 0) {
      test.skip(true, 'No seeded back orders to exercise the authorized path');
    }
    const res = await api.post(`/api/back-order/process/${items[0].id}`, { data: {} });
    // Role IS authorized — outcome may be 200/400, never 403.
    expect(res.status()).not.toBe(403);
    await api.dispose();
  });

  test('GUARD-HRE-009: Inventory Purchase POST back-order/process on a Ready/Rejected order → 400', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
    const items = await listItems(api, '/api/back-order');
    const stale = items.find((b) => b.current_status === 'Ready' || b.current_status === 'Rejected');
    if (!stale) {
      test.skip(true, "No seeded back order in 'Ready' or 'Rejected' status to trigger the 400");
    }
    const res = await api.post(`/api/back-order/process/${stale.id}`, { data: {} });
    expect(res.status()).toBe(400); // controller: current_status in [Ready, Rejected] → HTTP_BAD_REQUEST
    await api.dispose();
  });

  test('GUARD-HRE-010: Inventory Purchase POST back-order/process on nonexistent id → 404', async () => {
    const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
    const res = await api.post('/api/back-order/process/999999', { data: {} });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // proforma-invoice/fullPaid/{po_id} — route middleware: finance, director
  // ---------------------------------------------------------------------------

  test('GUARD-HRE-011: Service POST proforma-invoice/fullPaid (finance/director-only) → 403', async () => {
    const api = await ctxFor('hadi.s@bmj.com'); // Service — forbidden by route middleware
    const res = await api.post('/api/proforma-invoice/fullPaid/1', { data: {} });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-HRE-012: Unauthenticated POST proforma-invoice/fullPaid → 401', async () => {
    const res = await anon.post('/api/proforma-invoice/fullPaid/1', { data: {} });
    expect(res.status()).toBe(401);
  });

  test('GUARD-HRE-013: ALLOW-case — Finance POST proforma-invoice/fullPaid is NOT 403', async () => {
    const api = await ctxFor('fajar.n@bmj.com'); // Finance — authorized
    // fullPaid takes a PO id; pull a real one from the PO list, provisioning one (quotation→
    // approve→moveToPo) if the seeders left it empty, so the allow-case actually runs.
    const dir = await ctxFor('director.jkt@bmj.com');
    let pos = await listItems(dir, '/api/purchase-order');
    const poId = pos.length ? pos[0].id : (await provisionQuotationAndPo(dir)).poId;
    await dir.dispose();
    const res = await api.post(`/api/proforma-invoice/fullPaid/${poId}`, { data: {} });
    // Role IS authorized — outcome may be 200/400/404, never 403.
    expect(res.status()).not.toBe(403);
    await api.dispose();
  });

  test('GUARD-HRE-014: Finance POST proforma-invoice/fullPaid on a Rejected PO → 400', async () => {
    const api = await ctxFor('fajar.n@bmj.com'); // Finance — authorized
    // Self-provision a PO whose current_status is 'Rejected' (the business-rule trigger).
    const dir = await ctxFor('director.jkt@bmj.com');
    const pos = await listItems(dir, '/api/purchase-order');
    await dir.dispose();
    const rejected = pos.find((p) => p.current_status === 'Rejected');
    if (!rejected) {
      test.skip(true, "No seeded purchase order in 'Rejected' status to trigger the fullPaid 400");
    }
    const res = await api.post(`/api/proforma-invoice/fullPaid/${rejected.id}`, { data: {} });
    expect(res.status()).toBe(400); // controller: PO current_status === 'Rejected' → HTTP_BAD_REQUEST
    await api.dispose();
  });

  test('GUARD-HRE-015: Finance POST proforma-invoice/fullPaid on nonexistent po_id → 404', async () => {
    const api = await ctxFor('fajar.n@bmj.com'); // Finance — authorized
    const res = await api.post('/api/proforma-invoice/fullPaid/999999', { data: {} });
    expect(res.status()).toBe(404);
    await api.dispose();
  });
});
