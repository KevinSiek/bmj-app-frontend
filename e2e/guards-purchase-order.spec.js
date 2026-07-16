import { test, expect, request } from '@playwright/test';
import { provisionQuotationAndPo } from './helpers.js';

/**
 * Negative-path + authorization guards for PurchaseOrderController state-transition
 * endpoints (ready / release / done / decline / status). The happy path is exercised
 * elsewhere; this file pins the REJECTION behavior a determined API client can probe
 * directly, since a hidden UI button proves nothing about the route.
 *
 * AUTHZ note on the forbidden role: the route group is gated by
 *   role:marketing,finance,inventory,inventory_admin,director,service
 * The findings name "service_manager" as the forbidden role, but no such account is
 * seeded. The only SEEDED role that falls outside the allowed list is
 * "Inventory Purchase" (→ inventory_purchase), so inventory.purchase.jkt@bmj.com is used as the real,
 * loggable forbidden principal. Director is the paired ALLOW-case (authorized → not 403),
 * to rule out a blanket-deny false positive.
 *
 * NEGATIVE statuses are asserted EXACTLY as read from the controller:
 *   - status  : Rule::in() enum → 422 on invalid/missing status
 *   - decline : $request->validate(['notes'=>'required']) before txn → 422 on missing notes
 *   - ready   : no validation; REJECTED guard → 400 (no 422 path exists)
 *   - release : Validator::make() but returns 400 (NOT 422) on failure
 *   - done    : no validation/guards; findOrFail → 404 for a nonexistent id
 */
test.describe('GUARD: PurchaseOrderController negative-path & authz', () => {
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

  // Self-provision a real PO id as Director. The PO/Quotation seeders create zero rows, so we
  // read the list first and, if empty, create a quotation→approve→moveToPo to mint a real PO.
  // Returns a valid id (never null) so the negative/allow assertions actually run instead of
  // skipping. Throws if provisioning fails, so a setup break surfaces as a failure, not a skip.
  async function firstPurchaseOrderId() {
    const api = await ctxFor('director.jkt@bmj.com'); // Director — authorized, no 403
    const res = await api.get('/api/purchase-order/');
    expect(res.status()).toBe(200);
    let id = (await res.json())?.data?.data?.[0]?.id ?? null;
    if (id === null) {
      id = (await provisionQuotationAndPo(api)).poId;
    }
    await api.dispose();
    return id;
  }

  // ---- AUTHZ: forbidden role (Inventory Purchase) → 403 on every mutation ----

  test('GUARD-PO-002: Inventory Purchase cannot POST release → 403', async () => {
    const api = await ctxFor('inventory.purchase.jkt@bmj.com'); // Inventory Purchase
    const res = await api.post('/api/purchase-order/release/1', { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-PO-003: Inventory Purchase cannot POST done → 403', async () => {
    const api = await ctxFor('inventory.purchase.jkt@bmj.com'); // Inventory Purchase
    const res = await api.post('/api/purchase-order/done/1', { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-PO-004: Inventory Purchase cannot POST decline → 403', async () => {
    const api = await ctxFor('inventory.purchase.jkt@bmj.com'); // Inventory Purchase
    const res = await api.post('/api/purchase-order/decline/1', { data: { notes: 'x', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-PO-005: Inventory Purchase cannot POST status → 403', async () => {
    const api = await ctxFor('inventory.purchase.jkt@bmj.com'); // Inventory Purchase
    const res = await api.post('/api/purchase-order/status/1', { data: { status: 'Ready' } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-PO-006: Unauthenticated POST status returns 401', async () => {
    const res = await anon.post('/api/purchase-order/status/1', { data: { status: 'Ready' } });
    expect(res.status()).toBe(401);
  });

  // ---- ALLOW-case: an authorized role must NOT be blanket-denied ----

  test('GUARD-PO-007: Allow-case — Director POST status is NOT 403 (role authorized)', async () => {
    const id = await firstPurchaseOrderId();
    test.skip(!id, 'No purchase orders seeded — cannot exercise allow-case on a real id');
    const api = await ctxFor('director.jkt@bmj.com'); // Director — authorized for the group
    const res = await api.post(`/api/purchase-order/status/${id}`, { data: { status: 'Ready' } });
    // Whatever the business outcome, an authorized role must not be 403.
    expect(res.status()).not.toBe(403);
    await api.dispose();
  });

  // ---- NEGATIVE: status — Rule::in enum rejects invalid/missing status → 422 ----

  test('GUARD-PO-008: POST status with invalid status value → 422', async () => {
    const id = await firstPurchaseOrderId();
    test.skip(!id, 'No purchase orders seeded — cannot reach the validator on a real id');
    const api = await ctxFor('director.jkt@bmj.com'); // authorized; isolates the validator
    const res = await api.post(`/api/purchase-order/status/${id}`, { data: { status: 'InvalidStatus' } });
    expect(res.status()).toBe(422);
    await api.dispose();
  });

  test('GUARD-PO-009: POST status with missing status field → 422', async () => {
    const id = await firstPurchaseOrderId();
    test.skip(!id, 'No purchase orders seeded — cannot reach the validator on a real id');
    const api = await ctxFor('director.jkt@bmj.com'); // authorized; isolates the validator
    const res = await api.post(`/api/purchase-order/status/${id}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(422);
    await api.dispose();
  });

  // ---- NEGATIVE: decline — validate(notes required) BEFORE txn → 422 ----

  test('GUARD-PO-010: Director POST decline missing notes → 422', async () => {
    const id = await firstPurchaseOrderId();
    test.skip(!id, 'No purchase orders seeded — cannot reach the validator on a real id');
    // Director passes the explicit Finance/Director role check (line 894), so the only
    // rejection left is the missing-notes validator (422), not the role-400.
    const api = await ctxFor('director.jkt@bmj.com');
    const res = await api.post(`/api/purchase-order/decline/${id}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(422);
    await api.dispose();
  });

  // ---- NEGATIVE: done — no validation/guards; findOrFail → 404 for nonexistent id ----

  test('GUARD-PO-011: Director POST done to nonexistent id → 404', async () => {
    const api = await ctxFor('director.jkt@bmj.com'); // authorized; isolates findOrFail
    const res = await api.post('/api/purchase-order/done/999999', { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // ---- NEGATIVE: release — Validator::make() but returns 400 (NOT 422) on failure ----
  // release() sends an empty body against a real PO. The first rejection it can hit is one
  // of several BadRequest (400) guards: quotation missing, status REJECTED, quotation type
  // neither SERVICE nor SPAREPARTS, or the Validator failing for the matched type — ALL 400.
  // No 422 path exists here. The id must exist (else 404 from findOrFail), so this self-
  // provisions a real PO and skips when none are seeded.
  test('GUARD-PO-013: Director POST release with empty body → 400 (validator/business rule, never 422)', async () => {
    const id = await firstPurchaseOrderId();
    test.skip(!id, 'No purchase orders seeded — cannot reach the release guards on a real id');
    const api = await ctxFor('director.jkt@bmj.com'); // authorized; isolates the 400 guards
    const res = await api.post(`/api/purchase-order/release/${id}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(400);
    await api.dispose();
  });
});
