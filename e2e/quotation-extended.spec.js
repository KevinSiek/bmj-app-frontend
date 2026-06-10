import { test, expect } from '@playwright/test';

test.describe('Quotation Extended API Tests (Update, Versioning, Return)', () => {
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

    // Get a sparepart to use in quotations
    const spRes = await apiContext.get('/api/sparepart');
    const spBody = await spRes.json();
    sparepartId = spBody.data.data[0].id;
    globalThis.realPrice = Number(spBody.data.data[0].unit_price_sell);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test.describe('Quotation Update and Versioning (needChange)', () => {
    let quotationSlug;     // v1 slug
    let quotationNumber;
    let quotationDate;
    let v2Slug;            // slug of the version created by the update

    test('QUOT-EXT-001: Create Initial Quotation', async () => {
      const response = await apiContext.post('/api/quotation', {
        data: {
          project: {
            type: 'Spareparts',
          },
          customer: {
            companyName: 'PT E2E Quotation Update',
            address: 'Jl. Test',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            postal_code: '12345',
            postalCode: '12345',
            office: '021-123456',
            urban: 'Urban Test',
            subdistrict: 'Sub Test',
          },
          price: {
            amount: globalThis.realPrice * 2,
          },
          notes: 'Initial quotation',
          spareparts: [
            {
              sparepartId: sparepartId,
              quantity: 2,
              unitPriceSell: globalThis.realPrice
            }
          ]
        }
      });
      const body = await response.json();
      expect(response.status()).toBe(201);
      quotationSlug = body.data.slug;
      quotationNumber = body.data.quotation_number;
      quotationDate = '2026-06-06'; // backend accepts any valid date string
      expect(quotationSlug).toBeDefined();
    });

    test('QUOT-EXT-002: Update Quotation', async () => {
      expect(quotationSlug).toBeDefined();
      const response = await apiContext.put(`/api/quotation/${quotationSlug}`, {
        data: {
          project: {
            type: 'Spareparts',
            quotationNumber: quotationNumber,
            date: quotationDate
          },
          customer: {
            companyName: 'PT E2E Quotation Update',
            address: 'Jl. Test Updated',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            postalCode: '12345',
            office: '021-123456',
            urban: 'Urban Test',
            subdistrict: 'Sub Test',
          },
          price: {
            amount: globalThis.realPrice * 5,
          },
          notes: 'Updated quotation',
          spareparts: [
            {
              sparepartId: sparepartId,
              quantity: 5,
              unitPriceSell: globalThis.realPrice
            }
          ]
      }
      });
      const body = await response.json();
      // Updating a quotation creates a NEW VERSION (201), not an in-place edit.
      expect(response.status()).toBe(201);
      expect(body.data.version).toBe(2);
      expect(body.data.notes).toBe('Updated quotation');
      v2Slug = body.data.slug;
      expect(v2Slug).toBeDefined();
      expect(v2Slug).not.toBe(quotationSlug); // distinct slug per version

      // Read-back: the new version persists the updated address, and the number now
      // has exactly two versions (v1 + v2).
      const v2 = (await (await apiContext.get(`/api/quotation/${v2Slug}`)).json()).data;
      expect(v2.version).toBe(2);
      expect(v2.customer.address).toBe('Jl. Test Updated');

      const list = (await (await apiContext.get(`/api/quotation?search=${encodeURIComponent(quotationNumber)}`)).json()).data.data;
      const versions = list.filter((r) => r.quotation_number === quotationNumber).map((r) => r.version).sort();
      expect(versions).toEqual([1, 2]);
    });

    test('QUOT-EXT-003: Request Change (needChange) flips status to Change', async () => {
      expect(v2Slug).toBeDefined();
      const response = await apiContext.post(`/api/quotation/needChange/${v2Slug}`, {
        data: {
          notes: 'Please revise the quantity.'
        }
      });
      expect(response.status()).toBe(200);

      // Read-back: needChange moves the quotation to the 'Change' state.
      const after = (await (await apiContext.get(`/api/quotation/${v2Slug}`)).json()).data;
      expect(after.current_status).toBe('Change');
    });
  });


});
