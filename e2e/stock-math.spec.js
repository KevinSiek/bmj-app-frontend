import { test, expect } from '@playwright/test';

test.describe('Stock Math and Invariants API Tests', () => {
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

    // Get E2E Guaranteed Stock sparepart
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
    // API returns 'stocks' array with { branch_id, quantity, ... }
    const stocks = body.data?.stocks ?? [];
    const branchRecord = stocks.find(b => b.branch_id === branchId);
    return branchRecord ? Number(branchRecord.quantity) : 0;
  }

  // Helper: create a full PO pipeline (quotation → approve → moveToPo → moveToPi → ready)
  async function createReleasablePO(companyName, qty) {
    let response = await apiContext.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName,
          address: 'Jl. Test',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
          office: '021-123456',
          urban: 'Urban',
          subdistrict: 'Sub',
        },
        price: { amount: qty * 50000 },
        spareparts: [{ sparepartId, quantity: qty, unitPriceSell: 50000 }]
      }
    });
    let body = await response.json();
    expect(response.status()).toBe(201);
    const quotationSlug = body.data.slug;
    const quotationId = body.data.id;

    await apiContext.post(`/api/quotation/approve/${quotationSlug}`, { data: { notes: 'Approve', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });

    response = await apiContext.post(`/api/quotation/moveToPo/${quotationSlug}`, { data: { notes: 'Move to PO', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    body = await response.json();
    expect(response.status()).toBe(200);
    const poId = body.data.id;

    // Move to PI (required for ready)
    await apiContext.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'Create PI', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });

    // Set Ready
    const readyRes = await apiContext.post(`/api/purchase-order/ready/${poId}`, { data: { notes: 'Ready SP', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(readyRes.status()).toBe(200);

    return { poId, quotationSlug, quotationId };
  }

  test.describe('Stock Decrement (Release DO)', () => {
    test('STK-API-001: Releasing DO should decrement stock', async () => {
      const initialStock = await getStock();
      const qty = 2;

      const { poId } = await createReleasablePO('PT E2E Stock Decrement', qty);

      // 2. Release DO
      const response = await apiContext.post(`/api/purchase-order/release/${poId}`, { 
        data: { 
          deliveryOrder: {
            deliveryOrderDate: '2026-06-06',
            pickedBy: 'Courier',
            shipMode: 'Land',
            orderType: 'Normal'
          },
          notes: 'Release DO' 
        } 
      });
      expect(response.status()).toBe(200);

      // Assert Stock Decreased
      const finalStock = await getStock();
      expect(finalStock).toBe(initialStock - qty);
    });
  });

  test.describe('Stock Increment (Receive Buy)', () => {
    test('STK-API-002: Completing Buy should increment stock', async () => {
      const initialStock = await getStock();
      const qty = 5;

      // Create Buy directly (no need for quotation)
      let response = await apiContext.post('/api/buy', {
        data: {
          totalAmount: qty * 10000,
          branch: 'Jakarta',
          spareparts: [
            {
              sparepartId: sparepartId,
              quantity: qty,
              unitPriceBuy: 10000
            }
          ],
          notes: 'Buy from supplier'
      }
      });
      let body = await response.json();
      if (response.status() !== 201) {
        console.error("STK-API-002 ERROR:", body);
      }
      expect(response.status()).toBe(201);
      const buyId = body.data.id;

      // Approve Buy
      await apiContext.post(`/api/buy/approve/${buyId}`, { data: { notes: 'Approve Buy', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });

      // Mark Done (Receive) - increments stock
      response = await apiContext.post(`/api/buy/done/${buyId}`, { data: { notes: 'Received', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      expect(response.status()).toBe(200);

      // Assert Stock Increased
      const finalStock = await getStock();
      expect(finalStock).toBe(initialStock + qty);
    });
  });

  test.describe('Stock Restore (Decline/Return)', () => {
    test('STK-API-003: Returning PO after release should restore stock', async () => {
      const initialStock = await getStock();
      const qty = 3;

      // 1. Setup Order and Release (Decrements Stock)
      const { poId, quotationId, quotationSlug } = await createReleasablePO('PT E2E Stock Restore', qty);

      await apiContext.post(`/api/purchase-order/release/${poId}`, { 
        data: { 
          deliveryOrder: {
            deliveryOrderDate: '2026-06-06',
            pickedBy: 'Courier',
            shipMode: 'Land',
            orderType: 'Normal'
          },
          notes: 'Release DO' 
        } 
      });

      const stockAfterRelease = await getStock();
      expect(stockAfterRelease).toBe(initialStock - qty);

      // 2. Mark PO as Done (so we can trigger return)
      await apiContext.post(`/api/purchase-order/done/${poId}`, { data: { notes: 'Done', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });

      // 3. Return Quotation (POST /api/quotation/return/{id})
      const returnRes = await apiContext.post(`/api/quotation/return/${poId}`, { 
        data: { 
          returned: [
            { sparepart_id: sparepartId, quantity: qty }
          ],
          notes: 'Return Item' 
        } 
      });
      expect(returnRes.status()).toBe(200);

      // 4. Approve Return (Restores Stock)
      const approveRes = await apiContext.get(`/api/quotation/approveReturn/${quotationSlug}`);
      expect(approveRes.status()).toBe(200);

      // 5. Assert Stock Restored
      const finalStock = await getStock();
      expect(finalStock).toBe(initialStock);
    });
  });
});
