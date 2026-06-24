import { test, expect } from '@playwright/test';

test.describe('Customer and Seller API CRUD Tests', () => {
  let apiContext;
  let token;

  test.beforeAll(async ({ playwright }) => {
    // We create an independent request context to test the API directly
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
    });

    // Login as Director to get token
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

  test.describe('Customer CRUD', () => {
    let customerSlug;

    test('CUST-API-004: Create Customer', async () => {
      const response = await apiContext.post('/api/customer', {
        data: {
          company_name: 'PT E2E Test Customer',
          address: 'Jl. Test Customer No 1',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postal_code: '12345',
          office: '021-9876543',
          urban: 'Test Urban',
          subdistrict: 'Test Subdistrict',
          pic_name: 'Test PIC',
          pic_phone: '08123456789'
        }
      });
      const body = await response.json();
      expect(response.status()).toBe(201);
      
      // Store the slug for subsequent tests
      customerSlug = body.data.slug;
      expect(customerSlug).toBeDefined();
    });

    test('CUST-API-003: Get all Customers', async () => {
      const response = await apiContext.get('/api/customer?search=PT E2E Test Customer');
      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.data.data).toBeInstanceOf(Array);
      // Ensure our newly created customer is in the list
      const found = body.data.data.find(c => c.slug === customerSlug);
      expect(found).toBeDefined();
    });

    test('CUST-API-00x: Get single Customer', async () => {
      expect(customerSlug).toBeDefined();
      const response = await apiContext.get(`/api/customer/${customerSlug}`);
      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.data.company_name).toBe('PT E2E Test Customer');
    });

    test('CUST-API-00x: Update Customer', async () => {
      expect(customerSlug).toBeDefined();
      const response = await apiContext.put(`/api/customer/${customerSlug}`, {
        data: {
          company_name: 'PT E2E Test Customer Updated',
          address: 'Jl. Test Customer No 1',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postal_code: '12345',
          office: '021-9876543',
          urban: 'Test Urban',
          subdistrict: 'Test Subdistrict'
        }
      });
      expect(response.status()).toBe(200);
      
      // Verify update
      const getResponse = await apiContext.get(`/api/customer/${customerSlug}`);
      const getBody = await getResponse.json();
      expect(getBody.data.company_name).toBe('PT E2E Test Customer Updated');
    });

    test('CUST-API-00x: Delete Customer', async () => {
      expect(customerSlug).toBeDefined();
      const response = await apiContext.delete(`/api/customer/${customerSlug}`);
      expect(response.status()).toBe(200);

      // Verify deletion
      const getResponse = await apiContext.get(`/api/customer/${customerSlug}`);
      expect(getResponse.status()).toBe(404);
    });
  });

  test.describe('Seller CRUD', () => {
    let sellerCode;

    test('SELL-API-005: Create Seller', async () => {
      const response = await apiContext.post('/api/seller', {
        data: {
          code: 'SELL-E2E-001',
          name: 'PT E2E Test Seller',
          type: 'Distributor'
        }
      });
      const body = await response.json();
      expect(response.status()).toBe(201);
      
      sellerCode = body.data.code;
      expect(sellerCode).toBeDefined();
    });

    test('SELL-API-00x: Get all Sellers', async () => {
      const response = await apiContext.get('/api/seller?search=PT E2E Test Seller');
      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.data.data).toBeInstanceOf(Array);
      const found = body.data.data.find(s => s.code === sellerCode);
      expect(found).toBeDefined();
    });

    test('SELL-API-00x: Get single Seller', async () => {
      expect(sellerCode).toBeDefined();
      const response = await apiContext.get(`/api/seller/${sellerCode}`);
      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.data.name).toBe('PT E2E Test Seller');
    });

    test('SELL-API-00x: Update Seller', async () => {
      expect(sellerCode).toBeDefined();
      const response = await apiContext.put(`/api/seller/${sellerCode}`, {
        data: {
          code: 'SELL-E2E-001-UPD',
          name: 'PT E2E Test Seller Updated',
          type: 'Retailer'
        }
      });
      expect(response.status()).toBe(200);
      
      sellerCode = 'SELL-E2E-001-UPD';
      
      // Verify update
      const getResponse = await apiContext.get(`/api/seller/${sellerCode}`);
      const getBody = await getResponse.json();
      expect(getBody.data.name).toBe('PT E2E Test Seller Updated');
      expect(getBody.data.type).toBe('Retailer');
    });

    test('SELL-API-00x: Delete Seller', async () => {
      expect(sellerCode).toBeDefined();
      const response = await apiContext.delete(`/api/seller/${sellerCode}`);
      expect(response.status()).toBe(200);

      // Verify deletion
      const getResponse = await apiContext.get(`/api/seller/${sellerCode}`);
      expect(getResponse.status()).toBe(404);
    });
  });
});
