import { test, expect, request } from '@playwright/test';

/**
 * Group: BMJ App Backend Controllers - Rejection Behavior Analysis.
 *
 * Closes the negative-path and authz coverage gaps for the write endpoints on
 * Sparepart, Employee, Access, Customer, and Seller. Two properties are pinned per
 * endpoint family:
 *   - AUTHZ: a forbidden actor is rejected. For role-gated prefixes (sparepart →
 *     inventory/marketing/director, employee → director) a disallowed role gets 403;
 *     for ungated prefixes (access, customer, seller — auth:sanctum only, no role gate
 *     in routes/api.php) the only rejection an unauthorized caller hits is 401 anon.
 *     Every gated group is paired with an ALLOW-case asserting an authorized role does
 *     NOT get 403, ruling out a blanket-deny false positive (cf. SECW-008).
 *   - NEGATIVE: the minimal rejected request returns the EXACT status the controller
 *     emits — 422 from $request->validate(), 404 from a null lookup. Where an endpoint
 *     needs a real {id}/{slug} the test self-provisions it from the list endpoint as an
 *     authorized role; an empty list skips the test rather than guessing an id.
 *
 * Statuses asserted here come from reading the controllers, not from guessing:
 *   - Sparepart store/update validate (422) before the DB txn; destroy 404s on null.
 *   - Employee update validates (422); reset-password only looks up by slug (404 on null).
 *   - Access update/destroy have NO body validation — a bad id format would hit the DB
 *     and surface 500, so the only safe negative here is a clean 404 from a non-existent
 *     numeric id (see GAP fixme).
 *   - Customer destroy 404s on a missing slug.
 *   - Seller update validates (422); update/destroy match the route {slug} against the
 *     'code' column, so a non-existent code 404s.
 */
test.describe('BMJ App Backend Controllers - Rejection Behavior Analysis', () => {
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

  // Seeded accounts (all password 'password')
  const DIRECTOR = 'director.jkt@bmj.com';
  const MARKETING = 'citra.k@bmj.com';
  const INVENTORY_ADMIN = 'eko.p@bmj.com';
  const FINANCE = 'fajar.n@bmj.com';
  const SERVICE = 'hadi.s@bmj.com';

  // Guaranteed-nonexistent identifiers for not-found assertions.
  const MISSING_ID = 999999;
  const MISSING_SLUG = 'definitely-not-a-real-slug-999999';

  // ---------------------------------------------------------------------------
  // POST /api/sparepart — gated: inventory_purchase,inventory_admin,marketing,inventory,director
  // ---------------------------------------------------------------------------

  test('GUARD-RBA-001: Finance POST /api/sparepart (forbidden role) → 403', async () => {
    const api = await ctxFor(FINANCE);
    const res = await api.post('/api/sparepart', {
      data: { sparepartNumber: 'SP-AUTHZ', sparepartName: 'Authz Probe' },
    });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-RBA-002: Inventory Admin POST /api/sparepart missing required fields → 422', async () => {
    const api = await ctxFor(INVENTORY_ADMIN);
    // Omit sparepartName/totalUnit/unitPriceSell etc → $request->validate() fails (line 203-215).
    const res = await api.post('/api/sparepart', { data: { sparepartNumber: 'SP-NEG-422' } });
    expect(res.status()).toBe(422);
    await api.dispose();
  });

  test('GUARD-RBA-003: Allow-case — Inventory Admin POST /api/sparepart (authorized role) NOT 403', async () => {
    const api = await ctxFor(INVENTORY_ADMIN);
    const res = await api.post('/api/sparepart', {
      data: { sparepartNumber: `SP-ALLOW-${Date.now()}` },
    });
    // Empty/invalid body → 422, valid would be 201; either way the role IS authorized.
    expect(res.status()).not.toBe(403);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // PUT /api/sparepart/{id} — gated as above
  // ---------------------------------------------------------------------------

  test('GUARD-RBA-004: Service PUT /api/sparepart/{id} (forbidden role) → 403', async () => {
    const api = await ctxFor(SERVICE);
    const res = await api.put(`/api/sparepart/${MISSING_ID}`, { data: { sparepartNumber: 'x' } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-RBA-005: Inventory Admin PUT /api/sparepart/{id} missing required fields → 422', async () => {
    const api = await ctxFor(INVENTORY_ADMIN);
    // Self-provision a real id so the request reaches the controller; validation (line
    // 301-313) runs before findOrFail, so a missing field 422s regardless.
    const list = await api.get('/api/sparepart');
    expect(list.status()).toBe(200);
    const body = await list.json();
    const items = body?.data?.data ?? [];
    test.skip(items.length === 0, 'No spareparts seeded to self-provision an id');
    const id = items[0].id;
    const res = await api.put(`/api/sparepart/${id}`, { data: { sparepartName: 'only-one-field' } });
    expect(res.status()).toBe(422);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/sparepart/{id} — gated as above
  // ---------------------------------------------------------------------------

  test('GUARD-RBA-006: Finance DELETE /api/sparepart/{id} (forbidden role) → 403', async () => {
    const api = await ctxFor(FINANCE);
    const res = await api.delete(`/api/sparepart/${MISSING_ID}`);
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-RBA-007: Inventory Admin DELETE /api/sparepart/{nonexistent} → 404', async () => {
    const api = await ctxFor(INVENTORY_ADMIN);
    // lockForUpdate()->find($id) returns null (line 174) → handleNotFound (line 178).
    const res = await api.delete(`/api/sparepart/${MISSING_ID}`);
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // PUT /api/employee/{slug} — gated: director only
  // ---------------------------------------------------------------------------

  test('GUARD-RBA-008: Marketing PUT /api/employee/{slug} (non-Director) → 403', async () => {
    const api = await ctxFor(MARKETING);
    const res = await api.put(`/api/employee/${MISSING_SLUG}`, { data: { fullname: 'x' } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-RBA-009: Director PUT /api/employee/{slug} missing required fields → 422', async () => {
    const api = await ctxFor(DIRECTOR);
    // Self-provision a real slug; validation (line 93-99) runs before the lookup, so a
    // missing field 422s. (Empty body alone proves the guard.)
    const list = await api.get('/api/employee');
    expect(list.status()).toBe(200);
    const body = await list.json();
    const items = body?.data?.data ?? [];
    test.skip(items.length === 0, 'No employees seeded to self-provision a slug');
    const slug = items[0].slug;
    const res = await api.put(`/api/employee/${slug}`, { data: { fullname: 'Only Fullname' } });
    expect(res.status()).toBe(422);
    await api.dispose();
  });

  test('GUARD-RBA-010: Allow-case — Director PUT /api/employee/{slug} (authorized role) NOT 403', async () => {
    const api = await ctxFor(DIRECTOR);
    const res = await api.put(`/api/employee/${MISSING_SLUG}`, { data: { fullname: 'x' } });
    // Validation fires first (422); the role IS authorized so it must not be 403.
    expect(res.status()).not.toBe(403);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // POST /api/employee/reset-password/{slug} — gated: director only
  // ---------------------------------------------------------------------------

  test('GUARD-RBA-011: Finance POST /api/employee/reset-password/{slug} (non-Director) → 403', async () => {
    const api = await ctxFor(FINANCE);
    const res = await api.post(`/api/employee/reset-password/${MISSING_SLUG}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('GUARD-RBA-012: Director POST /api/employee/reset-password/{nonexistent} → 404', async () => {
    const api = await ctxFor(DIRECTOR);
    // where('slug',$slug)->lockForUpdate()->first() null (line 136) → 404 (line 141).
    const res = await api.post(`/api/employee/reset-password/${MISSING_SLUG}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // PUT /api/access/{id} — ungated (auth:sanctum only); no body validation
  // ---------------------------------------------------------------------------

  test('GUARD-RBA-013: Anonymous PUT /api/access/{id} (unauthenticated) → 401', async () => {
    const res = await anon.put(`/api/access/${MISSING_ID}`, { data: { access: 'x' } });
    expect(res.status()).toBe(401);
  });

  test('GUARD-RBA-014: Finance PUT /api/access/{nonexistent} → 404', async () => {
    const api = await ctxFor(FINANCE);
    // No role gate on /access; Accesses::find($id) null (line 65) → handleNotFound (line 68).
    const res = await api.put(`/api/access/${MISSING_ID}`, { data: { access: 'renamed' } });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // The static read predicted a 500 here (no id validation). VERIFIED at runtime: it's a clean
  // 404. Accesses::find('not-a-number') casts the non-numeric string to integer 0 in the query,
  // matches no row → null → handleNotFound → 404. So a malformed id is handled gracefully, not a
  // crash — we assert the real, correct behavior instead of a phantom gap.
  test('GUARD-RBA-015: PUT /api/access/{badFormat} → 404 (non-numeric id resolves to no row)', async () => {
    const api = await ctxFor(FINANCE);
    const res = await api.put('/api/access/not-a-number', { data: { access: 'x' } });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/access/{id} — ungated; no body validation
  // ---------------------------------------------------------------------------

  test('GUARD-RBA-016: Anonymous DELETE /api/access/{id} (unauthenticated) → 401', async () => {
    const res = await anon.delete(`/api/access/${MISSING_ID}`);
    expect(res.status()).toBe(401);
  });

  test('GUARD-RBA-017: Finance DELETE /api/access/{nonexistent} → 404', async () => {
    const api = await ctxFor(FINANCE);
    // Accesses::find($id) null (line 89) → handleNotFound (line 92).
    const res = await api.delete(`/api/access/${MISSING_ID}`);
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/customer/{slug} — ungated; no body validation
  // ---------------------------------------------------------------------------

  test('GUARD-RBA-018: Anonymous DELETE /api/customer/{slug} (unauthenticated) → 401', async () => {
    const res = await anon.delete(`/api/customer/${MISSING_SLUG}`);
    expect(res.status()).toBe(401);
  });

  test('GUARD-RBA-019: Marketing DELETE /api/customer/{nonexistent} → 404', async () => {
    const api = await ctxFor(MARKETING);
    // where('slug',$slug)->lockForUpdate()->first() null (line 161) → 404 (line 164).
    const res = await api.delete(`/api/customer/${MISSING_SLUG}`);
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // PUT /api/seller/{slug} — ungated; validates code/name; lookup matches 'code' column
  // ---------------------------------------------------------------------------

  test('GUARD-RBA-020: Anonymous PUT /api/seller/{slug} (unauthenticated) → 401', async () => {
    const res = await anon.put(`/api/seller/${MISSING_SLUG}`, { data: { code: 'x', name: 'y' } });
    expect(res.status()).toBe(401);
  });

  test('GUARD-RBA-021: Finance PUT /api/seller/{slug} missing required fields → 422', async () => {
    const api = await ctxFor(FINANCE);
    // $request->validate() (line 106-110) requires code+name; omit both → 422 before the
    // 'code'-column lookup, so the {slug} value is irrelevant here.
    const res = await api.put(`/api/seller/${MISSING_SLUG}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(422);
    await api.dispose();
  });

  test('GUARD-RBA-022: Finance PUT /api/seller/{nonexistent code} with valid body → 404', async () => {
    const api = await ctxFor(FINANCE);
    // Valid body passes validation; Seller::where('code',$slug)->first() null (line 114) → 404.
    const res = await api.put(`/api/seller/${MISSING_SLUG}`, { data: { code: MISSING_SLUG, name: 'Ghost Seller' } });
    expect(res.status()).toBe(404);
    await api.dispose();
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/seller/{slug} — ungated; lookup matches 'code' column
  // ---------------------------------------------------------------------------

  test('GUARD-RBA-023: Anonymous DELETE /api/seller/{slug} (unauthenticated) → 401', async () => {
    const res = await anon.delete(`/api/seller/${MISSING_SLUG}`);
    expect(res.status()).toBe(401);
  });

  test('GUARD-RBA-024: Finance DELETE /api/seller/{nonexistent code} → 404', async () => {
    const api = await ctxFor(FINANCE);
    // Seller::where('code',$slug)->lockForUpdate()->first() null (line 146) → 404 (line 149).
    const res = await api.delete(`/api/seller/${MISSING_SLUG}`);
    expect(res.status()).toBe(404);
    await api.dispose();
  });
});
