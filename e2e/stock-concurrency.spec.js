import { test, expect } from '@playwright/test';

/**
 * Stock concurrency / TOCTOU. stock-math.spec.js proves the single-threaded happy-path
 * invariants; this fires concurrent stock-mutating transitions at the SAME low-stock part.
 *
 * Verified decrement point: stock decrements at moveToPo (quotation → PO), NOT at release.
 *
 * Stock is ALLOWED to go negative (QuotationController.php — raw `stock - ordered`): a
 * negative quantity IS the running indent (how many units the branch owes), and the same
 * shortfall is also tracked by the BackOrder. STKC-001 guards that over-ordering drives stock
 * negative by exactly the shortfall (it does NOT floor at 0).
 *
 * The decrement runs under lockForUpdate, so concurrent moveToPo calls are serialized with
 * NO lost update. STKC-002 guards that race property on a well-stocked part: the total drop
 * equals the sum of ordered quantities regardless of interleaving.
 */
test.describe('Stock Concurrency / TOCTOU API Tests', () => {
  let api;
  let lowPartId;
  const branchId = 1;

  async function director(playwright) {
    const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    const res = await ctx.post('/api/login', { data: { email: 'director.jkt@bmj.com', password: 'password' } });
    const body = await res.json();
    expect(body.access_token).toBeDefined();
    await ctx.dispose();
    return playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}`, Accept: 'application/json' },
    });
  }

  async function stock() {
    const d = (await (await api.get(`/api/sparepart/${lowPartId}`)).json()).data;
    const b = (d.stocks ?? []).find((x) => x.branch_id === branchId);
    return b ? Number(b.quantity) : 0;
  }

  async function approvedQuotation(companyName, qty) {
    const res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts', branch: 'Jakarta' },
        customer: {
          companyName, address: 'Jl. T', city: 'Jakarta', province: 'DKI Jakarta',
          postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
        },
        price: { amount: qty * 50000 },
        spareparts: [{ sparepartId: lowPartId, quantity: qty, unitPriceSell: 50000 }],
      },
    });
    const body = await res.json();
    expect(res.status()).toBe(201);
    await api.post(`/api/quotation/approve/${body.data.slug}`, { data: { notes: 'Approve' } });
    return body.data.slug;
  }

  // A well-stocked part for the no-lost-update race test (so both decrements stay positive,
  // isolating the lost-update property from the over-order/negative behavior).
  let guaranteedPartId;

  async function stockOf(partId) {
    const d = (await (await api.get(`/api/sparepart/${partId}`)).json()).data;
    const b = (d.stocks ?? []).find((x) => x.branch_id === branchId);
    return b ? Number(b.quantity) : 0;
  }

  async function approvedQuotationFor(partId, companyName, qty) {
    const res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts', branch: 'Jakarta' },
        customer: {
          companyName, address: 'Jl. T', city: 'Jakarta', province: 'DKI Jakarta',
          postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
        },
        price: { amount: qty * 50000 },
        spareparts: [{ sparepartId: partId, quantity: qty, unitPriceSell: 50000 }],
      },
    });
    const body = await res.json();
    expect(res.status()).toBe(201);
    await api.post(`/api/quotation/approve/${body.data.slug}`, { data: { notes: 'Approve' } });
    return body.data.slug;
  }

  test.beforeAll(async ({ playwright }) => {
    api = await director(playwright);
    const low = (await (await api.get('/api/sparepart?search=E2E+Low')).json()).data.data[0];
    lowPartId = low.id;
    expect(lowPartId).toBeDefined();
    const guaranteed = (await (await api.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0];
    guaranteedPartId = guaranteed.id;
    expect(guaranteedPartId).toBeDefined();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  // Over-ordering drives branch stock NEGATIVE by exactly the shortfall — stock is allowed to
  // go below 0, where the negative value is the running indent. The same shortfall is also
  // tracked by the BackOrder. Regression guard for the "allow negative stock" behavior.
  test('STKC-001: over-ordering drives branch stock negative by the shortfall', async () => {
    const initial = await stock();
    // Order strictly more than whatever is available right now, by a known overshoot.
    const overshoot = 5;
    const order = Math.max(initial, 0) + overshoot;

    const slug = await approvedQuotation('PT Stock Negative', order);
    const res = await api.post(`/api/quotation/moveToPo/${slug}`, { data: { notes: 'PO negative' } });
    expect(res.status()).toBe(200);

    // Raw decrement: after = initial - order. With order = max(initial,0)+overshoot, a part
    // that started at `initial` ends at initial-order = -overshoot (when initial >= 0).
    const after = await stock();
    expect(after).toBe(initial - order);
    expect(after).toBeLessThan(0);
  });

  // The real race guard: two concurrent moveToPo calls on a well-stocked part each apply
  // their full decrement (lockForUpdate serializes them) — combined drop == sum of ordered
  // qty, no lost update. Uses the guaranteed-stock part so both decrements stay positive,
  // keeping this test about the race and not the over-order/negative path.
  test('STKC-002: concurrent moveToPo serialize with no lost update', async () => {
    const initial = await stockOf(guaranteedPartId);
    const qtyA = 3;
    const qtyB = 4;
    expect(initial).toBeGreaterThanOrEqual(qtyA + qtyB); // guaranteed part has ample stock

    const slugA = await approvedQuotationFor(guaranteedPartId, 'PT Concurrency A', qtyA);
    const slugB = await approvedQuotationFor(guaranteedPartId, 'PT Concurrency B', qtyB);

    const [resA, resB] = await Promise.all([
      api.post(`/api/quotation/moveToPo/${slugA}`, { data: { notes: 'PO A' } }),
      api.post(`/api/quotation/moveToPo/${slugB}`, { data: { notes: 'PO B' } }),
    ]);
    expect(resA.status()).toBe(200);
    expect(resB.status()).toBe(200);

    // No lost update: both decrements landed. Total drop == qtyA + qtyB exactly.
    const after = await stockOf(guaranteedPartId);
    expect(initial - after).toBe(qtyA + qtyB);
  });
});
