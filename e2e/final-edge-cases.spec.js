import { test, expect } from '@playwright/test';

test.describe('Final Edge Cases (100% Route Coverage)', () => {
  let api;
  let adminApi;

  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    const token = (await (await ctx.post('/api/login', {
      data: { email: 'director.jkt@bmj.com', password: 'password' },
    })).json()).access_token;
    expect(token).toBeDefined();

    const adminToken = (await (await ctx.post('/api/login', {
      data: { email: 'eko.p@bmj.com', password: 'password' }, // Inventory Admin
    })).json()).access_token;

    await ctx.dispose();

    api = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    
    adminApi = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' },
    });
  });

  test.afterAll(async () => {
    await api.dispose();
    await adminApi.dispose();
  });

  test('FEC-001: POST /api/sparepart-movement/cancel/{id} cancels a pending movement', async () => {
    // 1. Get a sparepart
    const spRes = await api.get('/api/sparepart?search=E2E');
    const sparepartId = (await spRes.json()).data?.data?.[0]?.id;
    expect(sparepartId).toBeDefined();

    // 2. Create Movement (Semarang to Jakarta)
    let res = await adminApi.post('/api/sparepart-movement', {
      data: {
        fromBranchId: 2,
        toBranchId: 1,
        movementDate: '2026-06-06',
        items: [{ sparepartId, quantity: 1, notes: 'To be cancelled' }]
      }
    });
    expect(res.status()).toBe(201);
    const movId = (await res.json()).data.id;

    // 3. Cancel the movement
    res = await adminApi.post(`/api/sparepart-movement/cancel/${movId}`);
    expect(res.status()).toBe(200);

    // 4. Verify status is Cancelled
    res = await adminApi.get(`/api/sparepart-movement/${movId}`);
    const mov = (await res.json()).data;
    expect(mov.status).toBe('Cancel');
  });

  test('FEC-002: GET /api/stock-movement returns valid paginated list', async () => {
    const res = await api.get('/api/stock-movement?page=1');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.data.data).toBeDefined(); // paginated
  });

  test('FEC-003: GET /api/stock-movement/suggestions returns branch suggestions', async () => {
    // 1. Get a sparepart
    const spRes = await api.get('/api/sparepart?search=E2E');
    const sparepartId = (await spRes.json()).data?.data?.[0]?.id;

    const res = await api.get(`/api/stock-movement/suggestions?sparepart_id=${sparepartId}&branch_id=1&qty=1`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    // Might be empty if no stock, but structure should be valid array
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('FEC-004: DELETE /api/sparepart/{id} handles Foreign Key constraints properly', async () => {
    // Create a dummy sparepart to ensure we can actually delete one cleanly
    let res = await api.post('/api/sparepart', {
      data: {
        sparepartNumber: `DEL-${Date.now()}`,
        sparepartName: 'To Be Deleted',
        unitPriceSell: 100,
        unitPriceBuy: 50,
      }
    });
    expect(res.status()).toBe(201);
    const delId = (await res.json()).data.id;

    // Delete it cleanly
    res = await api.delete(`/api/sparepart/${delId}`);
    expect(res.status()).toBe(200);

    // Now try to delete an E2E Guaranteed Stock Sparepart that is heavily tied to POs, WOs, Quotations, etc.
    const spRes = await api.get('/api/sparepart?search=E2E+Guaranteed+Stock');
    const fkId = (await spRes.json()).data?.data?.[0]?.id;
    
    res = await api.delete(`/api/sparepart/${fkId}`);
    // Should NOT be 500. It should either be 200 (if cascading soft deletes are implemented) or 400 (if blocked by DB).
    expect(res.status()).not.toBe(500);
  });

  test('FEC-005: GET /api/purchase-order/options/purchase-orders returns options', async () => {
    const res = await api.get('/api/purchase-order/options/purchase-orders');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.data)).toBe(true);
  });
});
