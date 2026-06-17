import { test, expect } from '@playwright/test';

test.describe('Back Order Double-Loop Fulfillment E2E Test', () => {
  let apiContext;
  let token;
  let sparepartId;
  const branchId = 1; // Jakarta branch

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
    });

    // Login as Director (has full access)
    const loginResponse = await apiContext.post('/api/login', {
      data: {
        email: 'director.jkt@bmj.com',
        password: 'password'
      }
    });
    const loginBody = await loginResponse.json();
    token = loginBody.access_token;
    expect(token).toBeDefined();

    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    // Get E2E Low Stock Sparepart (Seed ensures it has exactly 10 in stock)
    const spRes = await apiContext.get('/api/sparepart?search=E2E+Low+Stock');
    const spBody = await spRes.json();
    const sp = spBody.data?.data?.[0];
    expect(sp).toBeDefined();
    sparepartId = sp.id;
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('BO-DOUBLE: Buy partial, Analyze, Buy rest, Analyze', async () => {
    const orderQty = 30; // 30 ordered, 10 in stock = 20 shortfall.
    const buy1Qty = 12;  // Buy 12 (8 remaining shortfall).
    const buy2Qty = 8;   // Buy 8 (0 remaining shortfall).

    // 1. Create Quotation for 30 units
    let response = await apiContext.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName: 'PT BO Double Loop',
          address: 'Jl. Test',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
          office: '021-123456',
          urban: 'Urban',
          subdistrict: 'Sub',
        },
        price: { amount: orderQty * 50000 },
        spareparts: [{ sparepartId, quantity: orderQty, unitPriceSell: 50000 }]
      }
    });
    let body = await response.json();
    expect(response.status()).toBe(201);
    const quotationSlug = body.data.slug;

    // Approve Quotation
    await apiContext.post(`/api/quotation/approve/${quotationSlug}`, { data: { notes: 'Approve', poNumber: 'PO-DOUBLE' } });

    // Move to PO
    response = await apiContext.post(`/api/quotation/moveToPo/${quotationSlug}`, { data: { notes: 'Move to PO', poNumber: 'PO-DOUBLE' } });
    body = await response.json();
    expect(response.status()).toBe(200);
    const poId = body.data.id;
    const poNumber = body.data.purchase_order_number;

    // Move to PI & Ready (Prerequisites for release in some backend states, but BO triggers on release)
    await apiContext.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'PI', poNumber: 'PO-DOUBLE' } });
    await apiContext.post(`/api/purchase-order/ready/${poId}`, { data: { notes: 'Ready', poNumber: 'PO-DOUBLE' } });

    // Release PO -> This mints the Back Order due to shortfall
    response = await apiContext.post(`/api/purchase-order/release/${poId}`, { 
      data: { 
        notes: 'Release with shortfall',
        deliveryOrder: {
          deliveryOrderDate: '2026-06-06',
          pickedBy: 'Courier',
          shipMode: 'Land',
          orderType: 'Normal'
        }
      } 
    });
    expect(response.status()).toBe(200);

    // Get the Back Order
    response = await apiContext.get('/api/back-order');
    body = await response.json();
    const bo = body.data.data.find(b => b.purchase_order?.purchase_order_number === poNumber);
    expect(bo).toBeDefined();
    expect(bo.current_status).toBe('Process');
    const boId = bo.id;

    // Set BO to On Progress
    await apiContext.post(`/api/back-order/process/${boId}`, { data: { notes: 'Start BO process' } });

    // === LOOP 1: Buy Partial Stock ===
    response = await apiContext.post('/api/buy', {
      data: {
        totalAmount: buy1Qty * 10000,
        branch: 'Jakarta',
        backOrderId: boId,
        spareparts: [{ sparepartId, quantity: buy1Qty, unitPriceBuy: 10000 }],
        notes: 'Buy partial stock'
      }
    });
    expect(response.status()).toBe(201);
    let buy1Id = (await response.json()).data.id;

    // Approve and Receive (Done) Buy 1
    await apiContext.post(`/api/buy/approve/${buy1Id}`, { data: { notes: 'Approve partial' } });
    await apiContext.post(`/api/buy/done/${buy1Id}`, { data: { notes: 'Received partial' } });

    // Analyze BO after Loop 1
    response = await apiContext.post(`/api/back-order/process/${boId}`, { data: { notes: 'Analyze BO' } });
    // Still shortfall, so BO should remain On Progress, but response is 200
    expect(response.status()).toBe(200);
    
    response = await apiContext.get(`/api/back-order/${boId}`);
    body = await response.json();
    expect(body.data.current_status).toBe('Process'); // Still not fulfilled

    // === LOOP 2: Buy Remaining Stock ===
    response = await apiContext.post('/api/buy', {
      data: {
        totalAmount: buy2Qty * 10000,
        branch: 'Jakarta',
        backOrderId: boId,
        spareparts: [{ sparepartId, quantity: buy2Qty, unitPriceBuy: 10000 }],
        notes: 'Buy remaining stock'
      }
    });
    expect(response.status()).toBe(201);
    let buy2Id = (await response.json()).data.id;

    // Approve and Receive (Done) Buy 2
    await apiContext.post(`/api/buy/approve/${buy2Id}`, { data: { notes: 'Approve rest' } });
    await apiContext.post(`/api/buy/done/${buy2Id}`, { data: { notes: 'Received rest' } });

    // Analyze BO after Loop 2
    response = await apiContext.post(`/api/back-order/process/${boId}`, { data: { notes: 'Analyze BO again' } });
    expect(response.status()).toBe(200);

    // Verify BO is Done
    response = await apiContext.get(`/api/back-order/${boId}`);
    body = await response.json();
    expect(body.data.current_status).toBe('Ready'); // Fulfilled!

    // Verify original PO is unlocked (Ready or Release)
    response = await apiContext.get(`/api/purchase-order/${poId}`);
    body = await response.json();
    const poStatus = body.data.current_status;
    // When BO completes, it propagates 'Prepare' back to the PO.
    expect(poStatus).toBe('Prepare');
  });
});
