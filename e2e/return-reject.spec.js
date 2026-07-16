import { test, expect } from '@playwright/test';

/**
 * Return-decline flow. quotation-extended / OFE only cover the non-return 400 case and the
 * approve side (via stock-math STK-003). This covers declineReturn on an ACTUAL return:
 * a fully-released+done order is returned, then the return is rejected, leaving the
 * quotation in the Declined state.
 */
test.describe('Quotation Return — Decline Flow', () => {
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

  // Build a Quotation all the way to Done, returning { quotationSlug, poId }.
  async function completedOrder(companyName) {
    let res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName, address: 'A', city: 'Jakarta', province: 'DKI',
          postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S',
        npwp: '123', email: 'e2e@bmj.com',
        },
        price: { amount: 50000 },
        spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 50000 }],
      },
    });
    expect(res.status()).toBe(201);
    const quotationSlug = (await res.json()).data.slug;
    await api.post(`/api/quotation/approve/${quotationSlug}`, { data: { notes: 'a', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    res = await api.post(`/api/quotation/moveToPo/${quotationSlug}`, { data: { notes: 'po', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    const poId = (await res.json()).data.id;
    await api.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'pi', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    await api.post(`/api/purchase-order/release/${poId}`, {
      data: { deliveryOrder: { deliveryOrderDate: '2026-06-06', pickedBy: 'C', shipMode: 'Land', orderType: 'N' }, notes: 'r' },
    });
    await api.post(`/api/purchase-order/done/${poId}`, { data: { notes: 'done', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    return { quotationSlug, poId };
  }

  test('RJ-001: returning then rejecting the return leaves the quotation Declined', async () => {
    const { quotationSlug, poId } = await completedOrder('PT Return Decline');

    const ret = await api.post(`/api/quotation/return/${poId}`, {
      data: { returned: [{ sparepart_id: sparepartId, quantity: 1 }], notes: 'return it' },
    });
    expect(ret.status()).toBe(200);

    const reject = await api.get(`/api/quotation/rejectReturn/${quotationSlug}`);
    expect(reject.status()).toBe(200);

    const after = (await (await api.get(`/api/quotation/${quotationSlug}`)).json()).data;
    expect(after.current_status).toBe('Declined');
  });

  test('RJ-002: rejectReturn on a quotation that is not in a return state → 400', async () => {
    // A fresh, never-returned quotation.
    const res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName: 'PT Not Returned', address: 'A', city: 'Jakarta', province: 'DKI',
          postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S',
        npwp: '123', email: 'e2e@bmj.com',
        },
        price: { amount: 50000 },
        spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 50000 }],
      },
    });
    const slug = (await res.json()).data.slug;
    const reject = await api.get(`/api/quotation/rejectReturn/${slug}`);
    expect(reject.status()).toBe(400);
  });
});
