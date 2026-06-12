import { test, expect } from '@playwright/test';

/**
 * Illegal state-machine transitions. Each asserts the backend guard rejects an
 * out-of-order operation (400 + a descriptive message), pinning the business rule.
 */
test.describe('Illegal State Transitions', () => {
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

  test.afterAll(async () => {
    await api.dispose();
  });

  const customer = {
    companyName: 'PT Illegal', address: 'A', city: 'Jakarta', province: 'DKI',
    postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S',
  };

  async function quotation(qty = 1) {
    const res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' }, customer, price: { amount: qty * 50000 },
        spareparts: [{ sparepartId, quantity: qty, unitPriceSell: 50000 }],
      },
    });
    expect(res.status()).toBe(201);
    return (await res.json()).data;
  }
  const approve = (slug) => api.post(`/api/quotation/approve/${slug}`, { data: { notes: 'Approve', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  const moveToPo = (slug) => api.post(`/api/quotation/moveToPo/${slug}`, { data: { notes: 'PO', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  const moveToPi = (id) => api.post(`/api/purchase-order/moveToPi/${id}`, { data: { notes: 'PI', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  const releaseDO = (id) => api.post(`/api/purchase-order/release/${id}`, {
    data: { deliveryOrder: { deliveryOrderDate: '2026-06-06', pickedBy: 'C', shipMode: 'Land', orderType: 'N' }, notes: 'R' },
  });

  test('ILL-001: moveToPo on an unapproved quotation is rejected', async () => {
    const q = await quotation();
    const res = await moveToPo(q.slug); // skipped approve
    expect(res.status()).toBe(400);
    expect((await res.json()).message).toMatch(/approved/i);
  });

  test('ILL-002: moveToPo twice (already has a PO) is rejected', async () => {
    const q = await quotation();
    await approve(q.slug);
    expect((await moveToPo(q.slug)).status()).toBe(200);
    const res = await moveToPo(q.slug);
    expect(res.status()).toBe(400);
    expect((await res.json()).message).toMatch(/already has a purchase order/i);
  });

  test('ILL-003: moveToPi twice (PI already exists) is rejected', async () => {
    const q = await quotation();
    await approve(q.slug);
    const poId = (await (await moveToPo(q.slug)).json()).data.id;
    expect((await moveToPi(poId)).status()).toBe(200);
    const res = await moveToPi(poId);
    expect(res.status()).toBe(400);
    expect((await res.json()).message).toMatch(/already has a proforma/i);
  });

  test('ILL-004: release a goods PO without a PI is rejected', async () => {
    const q = await quotation();
    await approve(q.slug);
    const poId = (await (await moveToPo(q.slug)).json()).data.id;
    const res = await releaseDO(poId); // no moveToPi
    expect(res.status()).toBe(400);
    expect((await res.json()).message).toMatch(/proforma invoice must exist/i);
  });

  test('ILL-005: release a rejected/declined PO is rejected', async () => {
    const q = await quotation();
    await approve(q.slug);
    const poId = (await (await moveToPo(q.slug)).json()).data.id;
    await moveToPi(poId);
    await api.post(`/api/purchase-order/decline/${poId}`, { data: { notes: 'decline', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    const res = await releaseDO(poId);
    expect(res.status()).toBe(400);
    expect((await res.json()).message).toMatch(/rejected/i);
  });

  // PO updateStatus now validates against the known PO status set (Rule::in): an arbitrary
  // value is rejected (422), a valid one persists. Regression guard for the enum fix.
  test('ILL-006: PO updateStatus rejects an arbitrary status (422) and accepts a valid one', async () => {
    const q = await quotation();
    await approve(q.slug);
    const poId = (await (await moveToPo(q.slug)).json()).data.id;

    const bogus = await api.post(`/api/purchase-order/status/${poId}`, { data: { status: 'TotallyBogusStatus' } });
    expect(bogus.status()).toBe(422);

    const valid = await api.post(`/api/purchase-order/status/${poId}`, { data: { status: 'Ready' } });
    expect(valid.status()).toBe(200);
    const after = (await (await api.get(`/api/purchase-order/${poId}`)).json()).data;
    expect(after.current_status).toBe('Ready');
  });
});
