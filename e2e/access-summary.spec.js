import { test, expect } from '@playwright/test';

test.describe('Access and Summary API Tests', () => {
  let apiContext;
  let token;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
    });

    // Login as Director to get token (Director has access to everything)
    const loginResponse = await apiContext.post('/api/login', {
      data: {
        email: 'director.jkt@bmj.com',
        password: 'password'
      }
    });
    const loginBody = await loginResponse.json();
    token = loginBody.access_token;
    expect(token).toBeDefined();

    // Re-create the context with the authorization header injected
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test.describe('Access CRUD', () => {
    let accessId;

    test('ACC-API-001: Create Access', async () => {
      const response = await apiContext.post('/api/access', {
        data: {
          access: 'E2E Test Access',
          route: '/e2e-test'
        }
      });
      const body = await response.json();
      if (response.status() !== 201) console.error(body);
      expect(response.status()).toBe(201);
      
      accessId = body.data.id;
      expect(accessId).toBeDefined();
    });

    test('ACC-API-002: Get all Accesses', async () => {
      const response = await apiContext.get('/api/access');
      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.data).toBeInstanceOf(Array);
      
      const found = body.data.find(a => a.id === accessId);
      expect(found).toBeDefined();
    });

    test('ACC-API-003: Get single Access', async () => {
      expect(accessId).toBeDefined();
      const response = await apiContext.get(`/api/access/${accessId}`);
      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.data.access).toBe('E2E Test Access');
    });

    test('ACC-API-004: Update Access', async () => {
      expect(accessId).toBeDefined();
      const response = await apiContext.put(`/api/access/${accessId}`, {
        data: {
          access: 'E2E Test Access Updated',
          route: '/e2e-test-updated'
        }
      });
      expect(response.status()).toBe(200);
      
      const getResponse = await apiContext.get(`/api/access/${accessId}`);
      const getBody = await getResponse.json();
      expect(getBody.data.access).toBe('E2E Test Access Updated');
    });

    test('ACC-API-005: Delete Access', async () => {
      expect(accessId).toBeDefined();
      const response = await apiContext.delete(`/api/access/${accessId}`);
      expect(response.status()).toBe(200);

      const getResponse = await apiContext.get(`/api/access/${accessId}`);
      expect(getResponse.status()).toBe(404);
    });
  });

  test.describe('Summary Endpoints', () => {
    // Director summary returns live monthly counts. Prove it reflects real data by
    // creating a quotation and asserting the quotation count strictly increases.
    test('SUM-API-001: Director Summary reflects a newly created quotation', async () => {
      const before = (await (await apiContext.get('/api/summary/director')).json()).data;
      expect(typeof before.quotation).toBe('number');
      expect(typeof before.purchase_order).toBe('number');
      expect(typeof before.work_order).toBe('number');
      expect(typeof before.delivery_order).toBe('number');

      const spId = (await (await apiContext.get('/api/sparepart')).json()).data.data[0].id;
      const create = await apiContext.post('/api/quotation', {
        data: {
          project: { type: 'Spareparts' },
          customer: {
            companyName: 'PT Summary Count', address: 'Jl. T', city: 'Jakarta',
            province: 'DKI Jakarta', postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
          npwp: '123', email: 'e2e@bmj.com',
        },
          price: { amount: 50000 },
          spareparts: [{ sparepartId: spId, quantity: 1, unitPriceSell: 50000 }],
        },
      });
      expect(create.status()).toBe(201);

      const after = (await (await apiContext.get('/api/summary/director')).json()).data;
      expect(after.quotation).toBe(before.quotation + 1);
    });

    test('SUM-API-002: Marketing Summary returns numeric counts', async () => {
      const body = await (await apiContext.get('/api/summary/marketing')).json();
      expect(body.data).toBeDefined();
      // Director (calling as Director) gets a marketing-shaped payload; assert it is an object of numbers.
      const numericValues = Object.values(body.data).filter((v) => typeof v === 'number');
      expect(numericValues.length).toBeGreaterThan(0);
    });

    test('SUM-API-003: Inventory Summary responds 200 with a data object', async () => {
      const res = await apiContext.get('/api/summary/inventory');
      expect(res.status()).toBe(200);
      expect((await res.json()).data).toBeDefined();
    });

    test('SUM-API-004: Finance Summary responds 200 with a data object', async () => {
      const res = await apiContext.get('/api/summary/finance');
      expect(res.status()).toBe(200);
      expect((await res.json()).data).toBeDefined();
    });

    test('SUM-API-005: Service Summary responds 200 with a data object', async () => {
      const res = await apiContext.get('/api/summary/service');
      expect(res.status()).toBe(200);
      expect((await res.json()).data).toBeDefined();
    });
  });
});
