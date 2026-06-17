import { test, expect } from '@playwright/test';

test.describe('Borrow Shortfall Reconciliation E2E Test', () => {
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

    // Get E2E Guaranteed Stock Sparepart (Seed ensures it has 500+ in stock)
    const spRes = await apiContext.get('/api/sparepart?search=E2E+Guaranteed');
    const spBody = await spRes.json();
    const sp = spBody.data?.data?.[0];
    expect(sp).toBeDefined();
    sparepartId = sp.id;
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  async function getStock() {
    const res = await apiContext.get(`/api/sparepart/${sparepartId}`);
    const body = await res.json();
    const stocks = body.data?.stocks ?? [];
    const branchRecord = stocks.find(b => b.branch_id === branchId);
    return branchRecord ? Number(branchRecord.quantity) : 0;
  }

  test('BOR-SHORTFALL: Partial return demands a Spareparts PO', async () => {
    const borrowQty = 10;
    const returnQty = 8;
    const shortfallQty = borrowQty - returnQty; // 2

    const initialStock = await getStock();

    // 1. Setup a Service PO to attach the Borrow to.
    let response = await apiContext.post('/api/quotation', {
      data: {
        project: { type: 'Service' },
        customer: {
          companyName: 'PT Borrow Service',
          address: 'Jl. Test', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021',
          urban: 'Urban', subdistrict: 'Sub'
        },
        price: { amount: 100000 },
        services: [{ service: 'Service AC', quantity: 1, unitPriceSell: 100000 }]
      }
    });
    let body = await response.json();
    if (response.status() !== 201) console.error("Quotation 1 error:", body);
    expect(response.status()).toBe(201);
    const serviceQuotationSlug = body.data.slug;

    await apiContext.post(`/api/quotation/approve/${serviceQuotationSlug}`, { data: { notes: 'Approve', poNumber: 'PO-SERV-1' } });
    response = await apiContext.post(`/api/quotation/moveToPo/${serviceQuotationSlug}`, { data: { notes: 'Move to PO', poNumber: 'PO-SERV-1' } });
    body = await response.json();
    const servicePoId = body.data.id;

    // 2. Create the Borrow for 10 units
    response = await apiContext.post('/api/borrow', {
      data: {
        purchaseOrderId: servicePoId,
        notes: 'Borrow 10 items for service',
        spareparts: [{ sparepartId, quantity: borrowQty }]
      }
    });
    body = await response.json();
    if (response.status() !== 201) console.error("Borrow error:", body);
    expect(response.status()).toBe(201);
    const borrowId = body.data.id;

    // 3. Approve and Send Borrow (Stock decreases by 10)
    await apiContext.post(`/api/borrow/approve/${borrowId}`, { data: { notes: 'Approve' } });
    response = await apiContext.post(`/api/borrow/send/${borrowId}`, { data: { notes: 'Send to field' } });
    expect(response.status()).toBe(200);

    const stockAfterSend = await getStock();
    expect(stockAfterSend).toBe(initialStock - borrowQty);

    // 4. Return (Kembali) the borrow
    response = await apiContext.post(`/api/borrow/kembali/${borrowId}`, { data: { notes: 'Returning to warehouse' } });
    expect(response.status()).toBe(200);

    // 5. Attempt Reconcile (Done) with only 8 units and NO Sparepart PO. Should fail 422.
    response = await apiContext.post(`/api/borrow/done/${borrowId}`, {
      data: {
        returned: [{ sparepartId, quantityReturn: returnQty }] // 8 instead of 10
      }
    });
    expect(response.status()).toBe(422); // Validation error (needs sparepartPoId)
    body = await response.json();
    expect(body.message).toContain('required');

    // 6. Create a Sparepart PO to cover the shortfall (2 units)
    response = await apiContext.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName: 'PT Sparepart Shortfall Fix',
          address: 'Jl. Test', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021',
          urban: 'Urban', subdistrict: 'Sub'
        },
        price: { amount: shortfallQty * 50000 },
        spareparts: [{ sparepartId, quantity: shortfallQty, unitPriceSell: 50000 }]
      }
    });
    expect(response.status()).toBe(201);
    body = await response.json();
    const shortfallQuotationSlug = body.data.slug;

    await apiContext.post(`/api/quotation/approve/${shortfallQuotationSlug}`, { data: { notes: 'Approve', poNumber: 'PO-SPARE-1' } });
    response = await apiContext.post(`/api/quotation/moveToPo/${shortfallQuotationSlug}`, { data: { notes: 'Move to PO', poNumber: 'PO-SPARE-1' } });
    body = await response.json();
    const shortfallPoId = body.data.id;

    // 7. Retry Reconcile (Done) with the new Sparepart PO ID. Should pass.
    response = await apiContext.post(`/api/borrow/done/${borrowId}`, {
      data: {
        returned: [{ sparepartId, quantityReturn: returnQty }],
        sparepartPoId: shortfallPoId
      }
    });
    expect(response.status()).toBe(200);

    // 8. Verify stock incremented by exactly the returned amount (8)
    const finalStock = await getStock();
    expect(finalStock).toBe(stockAfterSend + returnQty);
    expect(finalStock).toBe(initialStock - shortfallQty); // Net change is the shortfall.
  });
});
