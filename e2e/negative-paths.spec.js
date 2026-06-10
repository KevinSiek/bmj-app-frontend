import { test, expect } from '@playwright/test';

/**
 * Negative paths: validation (422) and not-found (404) across the API.
 *
 * These also act as regression guards for the backend fix that made handleError re-throw
 * HTTP exceptions (so findOrFail → 404 and validate → 422 instead of a generic 500), plus
 * the Customer/Seller/Access validation fixes.
 */
test.describe('Negative Paths: Validation (422) and Not Found (404)', () => {
  let api;

  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    const res = await ctx.post('/api/login', { data: { email: 'director.jkt@bmj.com', password: 'password' } });
    const token = (await res.json()).access_token;
    expect(token).toBeDefined();
    await ctx.dispose();
    api = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  // ---- Validation (422) on empty/invalid create bodies ----
  const validationCases = [
    { id: 'NEG-VAL-001', name: 'customer', path: '/api/customer' },
    { id: 'NEG-VAL-002', name: 'seller', path: '/api/seller' },
    { id: 'NEG-VAL-003', name: 'employee', path: '/api/employee' },
    { id: 'NEG-VAL-004', name: 'sparepart', path: '/api/sparepart' },
    { id: 'NEG-VAL-005', name: 'quotation', path: '/api/quotation' },
    { id: 'NEG-VAL-006', name: 'access', path: '/api/access' },
  ];
  for (const c of validationCases) {
    test(`${c.id}: POST ${c.name} with empty body → 422`, async () => {
      const res = await api.post(c.path, { data: {} });
      expect(res.status()).toBe(422);
      const body = await res.json();
      // Laravel validation responses carry an errors map.
      expect(body).toHaveProperty('message');
    });
  }

  test('NEG-VAL-007: Buy create with empty spareparts → 422', async () => {
    const res = await api.post('/api/buy', { data: { totalAmount: 1, branch: 'Jakarta', spareparts: [] } });
    expect(res.status()).toBe(422);
  });

  test('NEG-VAL-008: Quotation with negative quantity → 422', async () => {
    const sp = (await (await api.get('/api/sparepart')).json()).data.data[0];
    const res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName: 'PT Neg Qty', address: 'A', city: 'Jakarta', province: 'DKI',
          postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S',
        },
        price: { amount: 1000 },
        spareparts: [{ sparepartId: sp.id, quantity: -5, unitPriceSell: 1000 }],
      },
    });
    expect(res.status()).toBe(422);
  });

  // ---- Not found (404) on bogus identifiers ----
  const notFoundCases = [
    { id: 'NEG-404-001', name: 'customer', path: '/api/customer/does-not-exist' },
    { id: 'NEG-404-002', name: 'seller', path: '/api/seller/does-not-exist' },
    { id: 'NEG-404-003', name: 'employee', path: '/api/employee/does-not-exist' },
    { id: 'NEG-404-004', name: 'access', path: '/api/access/9999999' },
    { id: 'NEG-404-005', name: 'sparepart', path: '/api/sparepart/9999999' },
    { id: 'NEG-404-006', name: 'quotation', path: '/api/quotation/does-not-exist' },
    { id: 'NEG-404-007', name: 'purchase-order', path: '/api/purchase-order/9999999' },
    { id: 'NEG-404-008', name: 'proforma-invoice', path: '/api/proforma-invoice/9999999' },
    { id: 'NEG-404-009', name: 'work-order', path: '/api/work-order/9999999' },
    { id: 'NEG-404-010', name: 'delivery-order', path: '/api/delivery-order/9999999' },
    { id: 'NEG-404-011', name: 'back-order', path: '/api/back-order/9999999' },
    { id: 'NEG-404-012', name: 'buy', path: '/api/buy/9999999' },
    { id: 'NEG-404-013', name: 'invoice', path: '/api/invoice/9999999' },
  ];
  for (const c of notFoundCases) {
    test(`${c.id}: GET non-existent ${c.name} → 404`, async () => {
      const res = await api.get(c.path);
      expect(res.status()).toBe(404);
    });
  }

  // ---- Not found on mutations ----
  test('NEG-404-014: PUT non-existent customer → 404', async () => {
    const res = await api.put('/api/customer/does-not-exist', {
      data: {
        company_name: 'X', office: '1', address: 'A', urban: 'U',
        subdistrict: 'S', city: 'C', province: 'P', postal_code: 12345,
      },
    });
    expect(res.status()).toBe(404);
  });

  test('NEG-404-015: DELETE non-existent employee → 404', async () => {
    const res = await api.delete('/api/employee/does-not-exist');
    expect(res.status()).toBe(404);
  });

  test('NEG-404-016: POST dpPaid on non-existent PI → 404', async () => {
    const res = await api.post('/api/proforma-invoice/dpPaid/9999999', { data: {} });
    expect(res.status()).toBe(404);
  });
});
