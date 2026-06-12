import { test, expect } from '@playwright/test';

test.describe('Buy Extended API Tests (Reject, needChange)', () => {
  let apiContext;
  let token;
  let sparepartId;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
    });

    // Login as Director
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

    // Get a sparepart to use in Buy
    const spRes = await apiContext.get('/api/sparepart');
    const spBody = await spRes.json();
    sparepartId = spBody.data.data[0].id;
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test.describe('Buy Reject Flow', () => {
    let buyId;

    test('BUY-EXT-001: Create Buy', async () => {
      const response = await apiContext.post('/api/buy', {
        data: {
          totalAmount: 100000,
          notes: 'Test Buy Reject Flow',
          branch: 'Jakarta',
          spareparts: [
            {
              sparepartId: sparepartId,
              quantity: 10,
              unitPriceBuy: 10000
            }
          ]
        }
      });
      const body = await response.json();
      if (response.status() !== 201) console.error('Buy creation failed:', body);
      expect(response.status()).toBe(201);
      buyId = body.data.id;
      expect(buyId).toBeDefined();
    });

    test('BUY-EXT-002: Reject Buy', async () => {
      expect(buyId).toBeDefined();
      const response = await apiContext.post(`/api/buy/reject/${buyId}`, {
        data: { notes: 'Rejected due to budget', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` }
      });
      expect(response.status()).toBe(200);

      const getResponse = await apiContext.get(`/api/buy/${buyId}`);
      const getBody = await getResponse.json();
      expect(getBody.data.current_status).toBe('Rejected');
    });
  });

  test.describe('Buy needChange Flow', () => {
    let buyId;

    test('BUY-EXT-003: Create Buy for needChange', async () => {
      const response = await apiContext.post('/api/buy', {
        data: {
          buy_number: 'BUY-EXT-002',
          totalAmount: 150000,
          notes: 'Test Buy needChange Flow',
          branch: 'Jakarta',
          spareparts: [
            {
              sparepartId: sparepartId,
              quantity: 5,
              unitPriceBuy: 30000
            }
          ]
        }
      });
      const body = await response.json();
      if (response.status() !== 201) console.error('Buy creation failed 2:', body);
      expect(response.status()).toBe(201);
      buyId = body.data.id;
      expect(buyId).toBeDefined();
    });

    test('BUY-EXT-004: needChange Buy', async () => {
      expect(buyId).toBeDefined();
      const response = await apiContext.post(`/api/buy/needChange/${buyId}`, {
        data: { notes: 'Please review the quantity', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` }
      });
      expect(response.status()).toBe(200);
    });
  });
});
