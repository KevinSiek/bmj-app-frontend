import { test, expect } from '@playwright/test';

/**
 * List-filter CORRECTNESS. The earlier specs assert these endpoints respond 200; this asserts
 * they actually FILTER. The strongest correctness check for a boolean filter is that the two
 * flag values return DISJOINT sets (a row belongs to exactly one), plus that a record we know
 * should be in the "needs X" bucket actually appears there.
 *
 *   GET /api/quotation/review/{isNeedReview}  — where('review', !flag)
 *   GET /api/quotation/return/{isNeedReturn}  — where('is_return', !flag)
 *   GET /api/buy/review/{isNeedReview}        — where('review', !flag)
 */
test.describe('List-Filter Correctness', () => {
  let api;
  let sparepartId;

  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    const token = (await (await ctx.post('/api/login', {
      data: { email: 'director.jkt@bmj.com', password: 'password' },
    })).json()).access_token;
    expect(token).toBeDefined();
    await ctx.dispose();
    api = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    sparepartId = (await (await api.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0].id;
  });

  test.afterAll(async () => { await api.dispose(); });

  // Collect the id set of a paginated list endpoint (all pages). List endpoints return id as
  // a STRING; create endpoints return it as a NUMBER — so normalize everything to String.
  async function idSet(path) {
    const ids = new Set();
    let page = 1;
    for (;;) {
      const body = (await (await api.get(`${path}${path.includes('?') ? '&' : '?'}page=${page}`)).json()).data;
      const rows = body?.data ?? [];
      for (const r of rows) ids.add(String(r.id));
      if (!body || page >= (body.last_page ?? 1)) break;
      page += 1;
    }
    return ids;
  }
  const sid = (id) => String(id);

  async function rowsOf(path) {
    const body = (await (await api.get(path)).json()).data;
    return body?.data ?? [];
  }

  test('LF-001: quotation review/{1} and review/{0} are disjoint (the flag actually filters)', async () => {
    const a = await idSet('/api/quotation/review/1');
    const b = await idSet('/api/quotation/review/0');
    // The two flag values must partition the data — no row appears in both buckets.
    const overlap = [...a].filter((id) => b.has(id));
    expect(overlap).toEqual([]);
  });

  test('LF-002: a freshly created low-price (On Review) quotation appears in review/{1}', async () => {
    const created = (await (await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: { companyName: `PT LF ${Date.now()}`, address: 'A', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S' , npwp: '123', email: 'e2e@bmj.com' },
        price: { amount: 100 },
        spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 100 }], // low price → On Review
      },
    })).json()).data;
    expect(created.current_status).toBe('On Review');

    const needReview = await idSet('/api/quotation/review/1');
    expect(needReview.has(sid(created.id))).toBe(true);
    // And it must NOT be in the opposite bucket.
    const noReview = await idSet('/api/quotation/review/0');
    expect(noReview.has(sid(created.id))).toBe(false);
  });

  test('LF-003: every row returned by quotation review/{1} is a reviewable status', async () => {
    const rows = await rowsOf('/api/quotation/review/1');
    // The "needs review" bucket should not contain already-finalized statuses.
    for (const r of rows) {
      expect(['Approved', 'On Review', 'Change']).toContain(r.current_status);
    }
  });

  test('LF-004: buy review/{1} and review/{0} are disjoint', async () => {
    const a = await idSet('/api/buy/review/1');
    const b = await idSet('/api/buy/review/0');
    const overlap = [...a].filter((id) => b.has(id));
    expect(overlap).toEqual([]);
  });

  test('LF-005: quotation return/{1} and return/{0} are disjoint', async () => {
    const a = await idSet('/api/quotation/return/1');
    const b = await idSet('/api/quotation/return/0');
    const overlap = [...a].filter((id) => b.has(id));
    expect(overlap).toEqual([]);
  });

  // NOTE: the return filter flag is INVERTED (where('is_return', !flag)), so a quotation that
  // IS in a return state appears in return/{0}, and ones that are NOT appear in return/{1}.
  test('LF-006: a quotation put into a return state appears in return/{0} and not return/{1}', async () => {
    // Build a completed order, then return it.
    const resQ = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: { companyName: `PT LFR ${Date.now()}`, address: 'A', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S' , npwp: '123', email: 'e2e@bmj.com' },
        price: { amount: 50000 },
        spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 50000 }],
      },
    });
    expect(resQ.status()).toBe(201);
    const q = (await resQ.json()).data;
    await api.post(`/api/quotation/approve/${q.slug}`, { data: { notes: 'a', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    const resPo = await api.post(`/api/quotation/moveToPo/${q.slug}`, { data: { notes: 'po', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(resPo.status()).toBe(200);
    const poId = (await resPo.json()).data.id;
    await api.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'pi', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    await api.post(`/api/purchase-order/release/${poId}`, {
      data: { deliveryOrder: { deliveryOrderDate: '2026-06-06', pickedBy: 'C', shipMode: 'Land', orderType: 'N' }, notes: 'r' },
    });
    await api.post(`/api/purchase-order/done/${poId}`, { data: { notes: 'done', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    await api.post(`/api/quotation/return/${poId}`, { data: { returned: [{ sparepart_id: sparepartId, quantity: 1 }], notes: 'ret' } });

    const inReturnState = await idSet('/api/quotation/return/0'); // !0 = is_return true
    const notInReturnState = await idSet('/api/quotation/return/1'); // !1 = is_return false
    expect(inReturnState.has(sid(q.id))).toBe(true);
    expect(notInReturnState.has(sid(q.id))).toBe(false);
  });
});
