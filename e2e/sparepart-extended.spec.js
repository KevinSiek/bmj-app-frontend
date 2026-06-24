import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Sparepart Extended API Tests (Update, Delete, Bulk Import)', () => {
  let apiContext;
  let token;

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
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test.describe('Sparepart CRUD', () => {
    let sparepartId;

    test('SP-EXT-001: Create Sparepart', async () => {
      const response = await apiContext.post('/api/sparepart', {
        data: {
          sparepartNumber: `SP-EXT-${Date.now()}`,
          sparepartName: 'E2E Test Sparepart Extended',
          unitPriceBuy: 10000,
          unitPriceSell: 15000,
          unitPriceSeller: [], // Sellers
          totalUnit: [
            { name: 'Jakarta', stock: 100 },
            { name: 'Semarang', stock: 50 }
          ]
        }
      });
      const body = await response.json();
      expect(response.status()).toBe(201);
      sparepartId = body.data.id;
      expect(sparepartId).toBeDefined();
    });

    test('SP-EXT-002: Update Sparepart', async () => {
      expect(sparepartId).toBeDefined();
      const response = await apiContext.put(`/api/sparepart/${sparepartId}`, {
        data: {
          sparepartNumber: `SP-EXT-${Date.now()}-UPD`,
          sparepartName: 'E2E Test Sparepart Extended Updated',
          unitPriceBuy: 12000,
          unitPriceSell: 18000,
          unitPriceSeller: [],
          totalUnit: [
            { name: 'Jakarta', stock: 120 }
          ]
        }
      });
      expect(response.status()).toBe(200);

      const getResponse = await apiContext.get(`/api/sparepart/${sparepartId}`);
      const getBody = await getResponse.json();
      expect(getBody.data.sparepart_name).toBe('E2E Test Sparepart Extended Updated');
      expect(parseFloat(getBody.data.unit_price_buy)).toBe(12000);
    });

    test('SP-EXT-003: Delete Sparepart', async () => {
      expect(sparepartId).toBeDefined();
      const response = await apiContext.delete(`/api/sparepart/${sparepartId}`);
      expect(response.status()).toBe(200);

      const getResponse = await apiContext.get(`/api/sparepart/${sparepartId}`);
      expect(getResponse.status()).toBe(404);
    });
  });

  test.describe('Sparepart Bulk Import', () => {
    test('SP-EXT-004: Bulk Import with Invalid File', async () => {
      // The endpoint is POST /api/sparepart/updateAllData
      // It expects a multipart/form-data with a 'file' parameter (Excel).
      // Since we don't have a valid Excel template handy, we upload a dummy file to ensure it fails gracefully (validation error).
      
      const buffer = Buffer.from('This is not an excel file');
      
      const response = await apiContext.post('/api/sparepart/updateAllData', {
        multipart: {
          file: {
            name: 'dummy.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer: buffer,
          }
        }
      });

      // Expecting a failure because the file is not a valid excel file (either 422 or 500 depending on maatwebsite/excel handling)
      expect([422, 500, 400]).toContain(response.status());
    });
  });
});
