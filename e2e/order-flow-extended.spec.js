import { test, expect } from '@playwright/test';

/**
 * Covers previously-untested order-flow endpoints:
 *   - POST /api/purchase-order/status/{id}   (updateStatus — manual status override)
 *   - GET  /api/purchase-order/return        (getAllReturn — return-filtered list)
 *   - POST /api/proforma-invoice/moveToInvoice/{id}
 *   - GET  /api/quotation/return/{isNeedReturn}  (isNeedReturn list filter)
 *   - GET  /api/quotation/rejectReturn/{slug}    (declineReturn)
 *
 * API-direct, mirroring stock-math/buy-extended: Director context drives the full
 * pipeline, then exercises each endpoint and read-back-verifies the persisted effect.
 */
test.describe('Order Flow Extended API Tests', () => {
  let api;
  let sparepartId;

  async function director(playwright) {
    const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    const res = await ctx.post('/api/login', {
      data: { email: 'director.jkt@bmj.com', password: 'password' },
    });
    const body = await res.json();
    expect(body.access_token).toBeDefined();
    await ctx.dispose();
    return playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}`, Accept: 'application/json' },
    });
  }

  // Build a quotation → approve → PO, returning ids/slugs.
  async function createPO(companyName, qty = 1) {
    let res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName, address: 'Jl. Test', city: 'Jakarta', province: 'DKI Jakarta',
          postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
        },
        price: { amount: qty * 50000 },
        spareparts: [{ sparepartId, quantity: qty, unitPriceSell: 50000 }],
      },
    });
    let body = await res.json();
    expect(res.status()).toBe(201);
    const quotationSlug = body.data.slug;

    await api.post(`/api/quotation/approve/${quotationSlug}`, { data: { notes: 'Approve', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    res = await api.post(`/api/quotation/moveToPo/${quotationSlug}`, { data: { notes: 'Move to PO', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    body = await res.json();
    expect(res.status()).toBe(200);
    return { poId: body.data.id, quotationSlug };
  }

  test.beforeAll(async ({ playwright }) => {
    api = await director(playwright);
    const spRes = await api.get('/api/sparepart?search=E2E+Guaranteed');
    const spBody = await spRes.json();
    sparepartId = spBody.data?.data?.[0]?.id;
    expect(sparepartId).toBeDefined();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test('OFE-API-001: PO updateStatus persists the new status', async () => {
    const { poId } = await createPO('PT OFE Status');

    const res = await api.post(`/api/purchase-order/status/${poId}`, { data: { status: 'Prepare' } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.current_status).toBe('Prepare');

    // Read-back via detail endpoint
    const getRes = await api.get(`/api/purchase-order/${poId}`);
    const getBody = await getRes.json();
    expect(getBody.data.current_status).toBe('Prepare');
  });

  test('OFE-API-002: getAllReturn returns a paginated list', async () => {
    const res = await api.get('/api/purchase-order/return');
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Paginated envelope; data.data is the row array (may be empty if no returns yet)
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data.data)).toBe(true);
  });

  test('OFE-API-003: moveToInvoice creates an Invoice and blocks a second one', async () => {
    const { poId } = await createPO('PT OFE Invoice');

    // PO → PI
    let res = await api.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'Create PI', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(200);
    const piId = (await res.json()).data.id;
    expect(piId).toBeDefined();

    // PI → Invoice
    res = await api.post(`/api/proforma-invoice/moveToInvoice/${piId}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(200);
    const inv = (await res.json()).data;
    expect(inv.invoice_number).toBeTruthy();
    expect(inv.proforma_invoice_id).toBe(piId);

    // Second attempt is rejected (invoice already exists)
    res = await api.post(`/api/proforma-invoice/moveToInvoice/${piId}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(400);
  });

  test('OFE-API-004: isNeedReturn list endpoint responds', async () => {
    const res = await api.get('/api/quotation/return/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
  });

  test('OFE-API-005: declineReturn on a non-return quotation is rejected (400)', async () => {
    // Create a fresh quotation that is NOT in a return state.
    const res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName: 'PT OFE DeclineReturn', address: 'Jl. T', city: 'Jakarta',
          province: 'DKI Jakarta', postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
        },
        price: { amount: 50000 },
        spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 50000 }],
      },
    });
    const slug = (await res.json()).data.slug;

    // declineReturn requires is_return=true; on a normal quotation it must 400.
    const declineRes = await api.get(`/api/quotation/rejectReturn/${slug}`);
    expect(declineRes.status()).toBe(400);
  });
});
