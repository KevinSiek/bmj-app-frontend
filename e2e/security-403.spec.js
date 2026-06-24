import { test, expect, request } from '@playwright/test';

test.describe('RoleMiddleware API 403 Security Tests', () => {
  let requestContext;

  test.beforeAll(async ({ playwright }) => {
    requestContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: {
        'Accept': 'application/json'
      }
    });
  });

  test.afterAll(async () => {
    await requestContext.dispose();
  });

  // Helper to login and return an authenticated context
  async function getAuthenticatedContext(email, password = 'password') {
    const loginResponse = await requestContext.post('/api/login', {
      data: { email, password }
    });
    const body = await loginResponse.json();
    const token = body.access_token;

    expect(token).toBeDefined();

    return await request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  test('SEC-API-001: Unauthenticated request returns 401', async () => {
    const response = await requestContext.get('/api/quotation');
    expect(response.status()).toBe(401);
  });

  test('SEC-API-002: Marketing role restrictions (403)', async () => {
    const api = await getAuthenticatedContext('citra.k@bmj.com');

    // Marketing cannot access employees
    let res = await api.get('/api/employee');
    expect(res.status()).toBe(403);

    // Marketing cannot access work orders
    res = await api.get('/api/work-order');
    expect(res.status()).toBe(403);

    // Marketing cannot access delivery orders
    res = await api.get('/api/delivery-order');
    expect(res.status()).toBe(403);

    // Marketing CAN access quotations
    res = await api.get('/api/quotation');
    expect(res.status()).toBe(200);

    await api.dispose();
  });

  test('SEC-API-003: Finance role restrictions (403)', async () => {
    const api = await getAuthenticatedContext('fajar.n@bmj.com');

    // Finance cannot access employees
    let res = await api.get('/api/employee');
    expect(res.status()).toBe(403);

    // Finance cannot access work orders
    res = await api.get('/api/work-order');
    expect(res.status()).toBe(403);

    // Finance cannot access delivery orders
    res = await api.get('/api/delivery-order');
    expect(res.status()).toBe(403);

    // Finance CAN access invoices
    res = await api.get('/api/invoice');
    expect(res.status()).toBe(200);

    await api.dispose();
  });

  test('SEC-API-004: Inventory Admin role restrictions (403)', async () => {
    const api = await getAuthenticatedContext('eko.p@bmj.com');

    // Inventory Admin cannot access employees
    let res = await api.get('/api/employee');
    expect(res.status()).toBe(403);

    // Inventory Admin cannot access invoices
    res = await api.get('/api/invoice');
    expect(res.status()).toBe(403);

    // Inventory Admin CAN access delivery orders
    res = await api.get('/api/delivery-order');
    expect(res.status()).toBe(200);

    await api.dispose();
  });

  test('SEC-API-005: Service role restrictions (403)', async () => {
    const api = await getAuthenticatedContext('hadi.s@bmj.com');

    // Service cannot access invoices
    let res = await api.get('/api/invoice');
    expect(res.status()).toBe(403);

    // Service cannot access delivery orders
    res = await api.get('/api/delivery-order');
    expect(res.status()).toBe(403);

    // Service CAN access work orders
    res = await api.get('/api/work-order');
    expect(res.status()).toBe(200);

    await api.dispose();
  });
});
