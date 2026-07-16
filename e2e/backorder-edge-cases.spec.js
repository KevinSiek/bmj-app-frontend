import { test, expect } from '@playwright/test';

test.describe('Back Order Alternative Fulfillment & Edge Cases', () => {
  let api;
  let sparepartId;
  const jakartaBranchId = 1;
  const semarangBranchId = 2;

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

    // We need a sparepart to test with.
    // Ensure Semarang has stock and Jakarta has 0 stock so we can move it.
    const spRes = await api.get('/api/sparepart?search=E2E');
    const spBody = await spRes.json();
    sparepartId = spBody.data?.data?.[0]?.id;
    
    // Inject stock to Semarang using Buy
    if (sparepartId) {
      const buyRes = await api.post('/api/buy', {
        data: { totalAmount: 10000, notes: 'Inject for Movement Test', branch: 'Semarang', spareparts: [{ sparepartId, quantity: 20, unitPriceBuy: 1000 }] },
      });
      const buyId = (await buyRes.json()).data.id;
      await api.post(`/api/buy/approve/${buyId}`, { data: { notes: 'approve' } });
      await api.post(`/api/buy/done/${buyId}`, { data: { notes: 'done' } });
    }
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  async function createBackOrder(qty = 10) {
    // 1. Quotation in Jakarta (which has 0 stock of the sparepart)
    let res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: { companyName: 'PT Edge Case', address: 'Test', city: 'Test', province: 'Test', postalCode: '123', office: '123', urban: 'Test', subdistrict: 'Test', npwp: '123', email: 'e2e@bmj.com' },
        price: { amount: qty * 10000 },
        spareparts: [{ sparepartId, quantity: qty, unitPriceSell: 10000 }]
      }
    });
    const slug = (await res.json()).data.slug;

    // Approve
    await api.post(`/api/quotation/approve/${slug}`, { data: { notes: 'Approve', poNumber: `PO-EDGE-${Date.now()}` } });
    
    // Move to PO
    res = await api.post(`/api/quotation/moveToPo/${slug}`, { data: { notes: 'Move', poNumber: `PO-EDGE-${Date.now()}` } });
    const poId = (await res.json()).data.id;
    const poNum = (await res.json()).data.purchase_order_number;

    // PI and Ready
    await api.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'PI' } });
    await api.post(`/api/purchase-order/ready/${poId}`, { data: { notes: 'Ready' } });
    
    // Release (Creates BO)
    await api.post(`/api/purchase-order/release/${poId}`, { 
      data: { notes: 'Rel', deliveryOrder: { deliveryOrderDate: '2026-06-06', pickedBy: 'Test', shipMode: 'Land', orderType: 'Normal' } } 
    });

    // Find BO
    res = await api.get('/api/back-order');
    const bo = (await res.json()).data.data.find(b => b.purchase_order?.purchase_order_number === poNum);
    return bo.id;
  }

  test('BO-EDGE-001: Fulfill Back Order via Stock Movement from another branch', async () => {
    test.setTimeout(90000);
    const boId = await createBackOrder(5); // Jakarta needs 5

    // 1. Move stock from Semarang to Jakarta
    let res = await api.post('/api/sparepart-movement', {
      data: {
        fromBranchId: semarangBranchId,
        toBranchId: jakartaBranchId,
        movementDate: '2026-06-06',
        items: [{ sparepartId, quantity: 5, notes: 'Move for BO' }]
      }
    });
    expect(res.status()).toBe(201);
    const movId = (await res.json()).data.id;

    // Send and Receive movement
    await api.post(`/api/sparepart-movement/send/${movId}`);
    await api.post(`/api/sparepart-movement/receive/${movId}`);

    // 2. Process/Analyze Back Order
    res = await api.post(`/api/back-order/process/${boId}`, { data: { notes: 'Analyzing after movement' } });
    expect(res.status()).toBe(200);

    // BO should be Ready (fulfilled)
    res = await api.get(`/api/back-order/${boId}`);
    const boData = (await res.json()).data;
    expect(boData.current_status).toBe('Ready');
  });

  test('BO-EDGE-002: Fulfill Back Order via API Adjust (drop required quantity)', async () => {
    test.setTimeout(90000);
    const boId = await createBackOrder(100); // Jakarta needs 100, no stock

    // We realize the customer doesn't need 100 anymore, we just drop the requirement to 0 via adjust API
    let res = await api.post(`/api/back-order/adjust/${boId}`, {
      data: {
        spareparts: [{ sparepartId, order: 0 }] // Dropping the order to 0 fulfills the BO instantly
      }
    });
    expect(res.status()).toBe(200);

    // BO should be Ready (fulfilled) because nothing is required anymore
    res = await api.get(`/api/back-order/${boId}`);
    const boData = (await res.json()).data;
    expect(boData.current_status).toBe('Ready');
  });
});
