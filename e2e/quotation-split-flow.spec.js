import { test, expect } from '@playwright/test';

test.describe('Quotation Split (Mixed Indent & Available) Edge Case', () => {
  let api;
  let availableSparepartId;
  let indentSparepartId;

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

    // 1. Get an Available Sparepart (Guaranteed Stock)
    let spRes = await api.get('/api/sparepart?search=E2E+Guaranteed+Stock');
    let spBody = await spRes.json();
    availableSparepartId = spBody.data?.data?.[0]?.id;

    // 2. Get an Indent Sparepart (Low Stock, but we order 1000 to force indent)
    spRes = await api.get('/api/sparepart?search=E2E+Low+Stock');
    spBody = await spRes.json();
    indentSparepartId = spBody.data?.data?.[0]?.id;

    expect(availableSparepartId).toBeDefined();
    expect(indentSparepartId).toBeDefined();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test('MIXED-001: Mixed Quotation correctly splits into Delivery Order and Back Order upon Release', async () => {
    test.setTimeout(90000);

    // 1. Create Quotation in Jakarta with both items
    let res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: { companyName: 'PT Mixed Split', address: 'Test', city: 'Test', province: 'Test', postalCode: '123', office: '123', urban: 'Test', subdistrict: 'Test', npwp: '123', email: 'e2e@bmj.com' },
        price: { amount: (2 * 10000) + (1000 * 10000) },
        spareparts: [
          { sparepartId: availableSparepartId, quantity: 2, unitPriceSell: 10000 }, // We have guaranteed stock for this
          { sparepartId: indentSparepartId, quantity: 1000, unitPriceSell: 10000 }  // We definitely don't have 1000 of this
        ]
      }
    });
    expect(res.status()).toBe(201);
    const slug = (await res.json()).data.slug;

    // 2. Approve Quotation
    await api.post(`/api/quotation/approve/${slug}`, { data: { notes: 'Approve Mixed', poNumber: `PO-MIX-${Date.now()}` } });
    
    // 3. Move to PO
    res = await api.post(`/api/quotation/moveToPo/${slug}`, { data: { notes: 'Move', poNumber: `PO-MIX-${Date.now()}` } });
    expect(res.status()).toBe(200);
    const poId = (await res.json()).data.id;
    const poNum = (await res.json()).data.purchase_order_number;

    // 4. PI
    await api.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'PI' } });

    // 5. Release PO
    res = await api.post(`/api/purchase-order/release/${poId}`, { 
      data: { notes: 'Release Mixed', deliveryOrder: { deliveryOrderDate: '2026-06-06', pickedBy: 'Test', shipMode: 'Land', orderType: 'Normal' } } 
    });
    expect(res.status()).toBe(200);

    // 6. Verify Delivery Order exists and contains ONLY the available item
    res = await api.get('/api/delivery-order');
    const doItem = (await res.json()).data.data.find(d => d.purchase_order?.purchase_order_number === poNum);
    expect(doItem).toBeDefined();

    res = await api.get(`/api/delivery-order/${doItem.id}`);
    const doDetail = (await res.json()).data;
    
    expect(doDetail.spareparts.length).toBe(1);
    expect(doDetail.spareparts[0].sparepart_id).toBe(availableSparepartId);
    expect(Number(doDetail.spareparts[0].quantity)).toBe(2);

    // 7. Verify Back Order exists and contains ONLY the indent item
    res = await api.get('/api/back-order');
    const boItem = (await res.json()).data.data.find(b => b.purchase_order?.purchase_order_number === poNum);
    expect(boItem).toBeDefined();

    res = await api.get(`/api/back-order/${boItem.id}`);
    const boDetail = (await res.json()).data;
    
    expect(boDetail.spareparts.length).toBe(1);
    expect(boDetail.spareparts[0].sparepart_id).toBe(indentSparepartId);
    expect(Number(boDetail.spareparts[0].total_unit)).toBeGreaterThanOrEqual(0); // whatever stock it has
  });
});
