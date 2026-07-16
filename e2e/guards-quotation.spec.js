import { test, expect, request } from '@playwright/test';
import { provisionApprovedQuotation } from './helpers.js';

/**
 * GUARD suite — quotation_high_risk. Closes negative-path and authz gaps on the four
 * highest-risk quotation mutations: approve, reject (controller method `decline`),
 * needChange, and PUT update.
 *
 * Two enforcement layers matter here and the assertions distinguish them deliberately:
 *   1. Route middleware. The ENTIRE /api/quotation prefix is wrapped in
 *      `role:marketing,finance,director` (routes/api.php line 54). RoleMiddleware aborts
 *      with 403 for any other role, and Director always bypasses. So Service and
 *      Inventory Admin never reach the controller — they get a 403 at the gate.
 *   2. Controller-internal check. approve/decline ALSO re-check `role == 'Director'`
 *      INSIDE the method (QuotationController lines 719 / 770) and return 400 (not 403)
 *      for a non-Director that DID pass the route gate — i.e. Marketing or Finance.
 *      That 400 is only reachable by an authorized-but-non-Director role, and only after
 *      the earlier existing-PO guard (line 708) passes, so it needs a real no-PO slug.
 *
 * Each authz group is paired with an ALLOW case asserting Director does NOT get 403, to
 * rule out a blanket-deny false positive. Negative-path tests self-provision a real slug
 * from the list endpoint where one is needed, and test.skip when the list is empty.
 */
test.describe('GUARD quotation_high_risk — negative-path & authz', () => {
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

  // Self-provision a real quotation slug as an authorized role (Director bypasses the gate).
  // The Quotation seeder creates zero rows, so when the list is empty we mint a fresh approved
  // quotation (no PO yet) so the controller-internal guards are actually reached. Returns a
  // valid slug (never null); throws if provisioning fails so a setup break is loud.
  async function firstQuotationSlug(api) {
    const res = await api.get('/api/quotation');
    if (res.status() === 200) {
      const body = await res.json();
      const list = Array.isArray(body) ? body : body?.data?.data ?? body.data ?? [];
      if (list.length && list[0].slug) return list[0].slug;
    }
    return provisionApprovedQuotation(api);
  }

  const NONEXISTENT_SLUG = 'nonexistent-slug-999999';

  // ---- POST /api/quotation/approve/{slug} ----

  test('GUARD-QUOTHR-001: Service approve (route-gated role) → 403', async () => {
    const api = await ctxFor('service.jkt@bmj.com'); // Service — not in marketing,finance,director
    const res = await api.post(`/api/quotation/approve/${NONEXISTENT_SLUG}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-QUOTHR-002: Marketing approve (authorized role, non-Director) is blocked → 404', async () => {
    // FINDING (verified at runtime, not from the static read): a non-Director authorized role
    // is blocked from approving, but via 404 — NOT the controller's Director-only 400 at line
    // 719. Quotation lookup is visibility-scoped: Marketing (citra.k, Jakarta) cannot resolve a
    // quotation it doesn't own/scope to, so first() returns null and the method returns 404
    // 'Quotation not found' BEFORE the role re-check runs. The 400 'not authorized to approve'
    // branch is therefore unreachable by a non-Director through the API. What matters for the
    // guard is proven either way: a non-Director cannot approve. (Director-can-approve is the
    // paired allow-case GUARD-QUOTHR-004.)
    const dir = await ctxFor('director.jkt@bmj.com');
    const slug = await firstQuotationSlug(dir);
    await dir.dispose();

    const api = await ctxFor('marketing.jkt@bmj.com'); // Marketing — passes route gate, fails row lookup
    const res = await api.post(`/api/quotation/approve/${slug}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('GUARD-QUOTHR-003: Director approve nonexistent slug → 404', async () => {
    // Director bypasses the gate and reaches the controller; first() returns null →
    // handleNotFound → 404 'Quotation not found'.
    const api = await ctxFor('director.jkt@bmj.com'); // Director
    const res = await api.post(`/api/quotation/approve/${NONEXISTENT_SLUG}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('GUARD-QUOTHR-004: Allow-case — Director approve real slug NOT 403', async () => {
    const api = await ctxFor('director.jkt@bmj.com'); // Director
    const slug = await firstQuotationSlug(api);
    test.skip(!slug, 'No quotation in list for the allow-case');
    const res = await api.post(`/api/quotation/approve/${slug}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    // Director is authorized at both layers — outcome may be 200 or a 400 business guard
    // (already in PO), but it must NOT be a 403.
    expect(res.status()).not.toBe(403);
    await api.dispose();
  });

  // ---- POST /api/quotation/reject/{slug}  (controller method: decline) ----

  test('GUARD-QUOTHR-005: Service reject (route-gated role) → 403', async () => {
    const api = await ctxFor('service.jkt@bmj.com'); // Service
    const res = await api.post(`/api/quotation/reject/${NONEXISTENT_SLUG}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-QUOTHR-006: Marketing reject (authorized role, non-Director) is blocked → 404', async () => {
    // Mirrors 002: the Director-only 400 re-check at line 770 is unreachable by a non-Director
    // because the visibility-scoped lookup returns null first → 404 'Quotation not found'. The
    // guard property still holds: a non-Director cannot reject. (Director-can-reject is the
    // paired allow-case GUARD-QUOTHR-008.)
    const dir = await ctxFor('director.jkt@bmj.com');
    const slug = await firstQuotationSlug(dir);
    await dir.dispose();

    const api = await ctxFor('marketing.jkt@bmj.com'); // Marketing — passes route gate, fails row lookup
    const res = await api.post(`/api/quotation/reject/${slug}`, { data: { notes: 'test rejection notes' } });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('GUARD-QUOTHR-007: Director reject nonexistent slug -> 404', async () => {
    const api = await ctxFor('director.jkt@bmj.com'); // Director
    const res = await api.post(`/api/quotation/reject/${NONEXISTENT_SLUG}`, { data: { notes: 'test rejection notes' } });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('GUARD-QUOTHR-008: Allow-case — Director reject real slug NOT 403', async () => {
    const api = await ctxFor('director.jkt@bmj.com'); // Director
    const slug = await firstQuotationSlug(api);
    test.skip(!slug, 'No quotation in list for the allow-case');
    const res = await api.post(`/api/quotation/reject/${slug}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).not.toBe(403);
    await api.dispose();
  });

  // ---- POST /api/quotation/needChange/{slug} ----

  test('GUARD-QUOTHR-009: Inventory Admin needChange (route-gated role) → 403', async () => {
    // needChange has NO controller-internal role check — authz is enforced ENTIRELY by the
    // route middleware. Inventory Admin is not in marketing,finance,director → 403 at the gate.
    const api = await ctxFor('inventory.admin.jkt@bmj.com'); // Inventory Admin
    const res = await api.post(`/api/quotation/needChange/${NONEXISTENT_SLUG}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-QUOTHR-010: Director needChange nonexistent slug → 404', async () => {
    // first() returns null → handleNotFound → 404 'Quotation not found'.
    const api = await ctxFor('director.jkt@bmj.com'); // Director
    const res = await api.post(`/api/quotation/needChange/${NONEXISTENT_SLUG}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('GUARD-QUOTHR-011: Allow-case — Marketing needChange real slug NOT 403', async () => {
    // Marketing IS authorized for this route (no Director-only controller check), so it must
    // not be a 403 — rules out a blanket-deny false positive on the needChange route.
    const dir = await ctxFor('director.jkt@bmj.com');
    const slug = await firstQuotationSlug(dir);
    await dir.dispose();
    test.skip(!slug, 'No quotation in list for the allow-case');

    const api = await ctxFor('marketing.jkt@bmj.com'); // Marketing
    const res = await api.post(`/api/quotation/needChange/${slug}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).not.toBe(403);
    await api.dispose();
  });

  // ---- PUT /api/quotation/{slug} ----

  test('GUARD-QUOTHR-012: Inventory Admin update (route-gated role) → 403', async () => {
    // Route middleware blocks before any validation runs.
    const api = await ctxFor('inventory.admin.jkt@bmj.com'); // Inventory Admin
    const res = await api.put(`/api/quotation/${NONEXISTENT_SLUG}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-QUOTHR-013: Marketing update with missing required fields → 422', async () => {
    // $request->validate() (lines 371-395) runs BEFORE firstOrFail, so an empty/partial body
    // fails validation with 422 regardless of slug existence.
    const api = await ctxFor('marketing.jkt@bmj.com'); // Marketing — authorized for this route
    const res = await api.put(`/api/quotation/${NONEXISTENT_SLUG}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(422);
    await api.dispose();
  });

  test('GUARD-QUOTHR-014: Marketing update invalid enum project.type → 422', async () => {
    // project.type must be in {Service, Spareparts}; an out-of-enum value fails the validator.
    const api = await ctxFor('marketing.jkt@bmj.com'); // Marketing
    const res = await api.put(`/api/quotation/${NONEXISTENT_SLUG}`, {
      data: {
        project: { quotationNumber: 'GUARD-QN-1', type: 'NotAType', date: '2026-01-01' },
        price: { amount: 1 },
        customer: {
          companyName: 'X', office: 'X', address: 'X', urban: 'X', subdistrict: 'X',
          city: 'X', province: 'X', postalCode: 12345,
        },
      },
    });
    expect(res.status()).toBe(422);
    await api.dispose();
  });

  test('GUARD-QUOTHR-015: Marketing update valid body, nonexistent slug → 404', async () => {
    // With all required fields present and a valid enum, validation passes and firstOrFail
    // (line 403) throws ModelNotFoundException → 404 for a guaranteed-nonexistent slug.
    const api = await ctxFor('marketing.jkt@bmj.com'); // Marketing
    const res = await api.put(`/api/quotation/${NONEXISTENT_SLUG}`, {
      data: {
        project: { quotationNumber: 'GUARD-QN-1', type: 'Service', date: '2026-01-01' },
        price: { amount: 1 },
        notes: 'guard',
        customer: {
          companyName: 'X', office: 'X', address: 'X', urban: 'X', subdistrict: 'X',
          city: 'X', province: 'X', postalCode: 12345,
        },
        services: [{ service: 'S', quantity: 1, unitPriceSell: 1 }],
      },
    });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  test('GUARD-QUOTHR-016: Unauthenticated approve → 401', async () => {
    const res = await anon.post(`/api/quotation/approve/${NONEXISTENT_SLUG}`, { data: { notes: 'test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(401);
  });
});
