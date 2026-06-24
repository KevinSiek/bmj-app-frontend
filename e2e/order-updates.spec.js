import { test, expect } from '@playwright/test';

test.describe('Order Updates API Tests (PO, PI, WO, DO Updates)', () => {
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

    // Get a sparepart to use
    const spRes = await apiContext.get('/api/sparepart');
    const spBody = await spRes.json();
    sparepartId = spBody.data.data[0].id;
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test.describe('Order Lifecycle Updates', () => {
    let quotationSlug;
    let poId;
    let piId;
    let doId;
    let woId;

    test('ORD-EXT-001: Setup Orders', async () => {
      // 1. Create Quotation
      let response = await apiContext.post('/api/quotation', {
        data: {
          project: {
            type: 'Spareparts',
            branch: 'Jakarta'
          },
          price: {
            amount: 150000
          },
          customer: {
            companyName: 'PT E2E Order Updates',
            address: 'Jl. Test',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            postalCode: 12345,
            office: '021-123456',
            urban: 'Urban',
            subdistrict: 'Sub'
          },
          spareparts: [{ sparepartId: sparepartId, quantity: 1, unitPriceSell: 50000 }]
        }
      });
      let body = await response.json();
      quotationSlug = body.data.slug;
      
      // 2. Approve Quotation
      await apiContext.post(`/api/quotation/approve/${quotationSlug}`, { data: { notes: 'Approve', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      
      // 3. Move to PO
      response = await apiContext.post(`/api/quotation/moveToPo/${quotationSlug}`, { data: { notes: 'Move to PO', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      body = await response.json();
      poId = body.data.id;
      
      // 4. Move to PI
      response = await apiContext.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'Move to PI', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      body = await response.json();
      piId = body.data.id;

      // 5. Setup Service PO for WO
      response = await apiContext.post('/api/quotation', {
        data: {
          project: {
            type: 'Service',
            branch: 'Jakarta'
          },
          price: {
            amount: 150000
          },
          customer: {
            companyName: 'PT E2E Service Updates',
            address: 'Jl. Test',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            postalCode: 12345,
            office: '021-123456',
            urban: 'Urban',
            subdistrict: 'Sub'
          },
          services: [{ service: 'Repair', quantity: 1, unitPriceSell: 150000 }]
        }
      });
      body = await response.json();
      let serviceQuotationSlug = body.data.slug;
      
      await apiContext.post(`/api/quotation/approve/${serviceQuotationSlug}`, { data: { notes: 'Approve Service', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      response = await apiContext.post(`/api/quotation/moveToPo/${serviceQuotationSlug}`, { data: { notes: 'Move to Service PO', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      body = await response.json();
      let servicePoId = body.data.id;

      // Ensure Ready state to release
      await apiContext.post(`/api/purchase-order/ready/${poId}`, { data: { notes: 'Ready SP', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      await apiContext.post(`/api/purchase-order/ready/${servicePoId}`, { data: { notes: 'Ready SRV', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });

      // Create PI for Service PO and Pay DP (required before releasing Work Order)
      response = await apiContext.post(`/api/purchase-order/moveToPi/${servicePoId}`, { data: { notes: 'Move Service to PI', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      body = await response.json();
      let servicePiId = body.data.id;
      await apiContext.post(`/api/proforma-invoice/dpPaid/${servicePiId}`, { data: { notes: 'Pay DP Service', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });

      // 6. Release to DO and WO
      response = await apiContext.post(`/api/purchase-order/release/${poId}`, {
        data: {
          notes: 'Release DO',
          deliveryOrder: {
            deliveryOrderDate: '2026-06-03',
            preparedBy: 'E2E Prep',
            receivedBy: 'E2E Recv',
            pickedBy: 'E2E Pick',
            shipMode: 'Land',
            orderType: 'Regular'
          }
        }
      });
      body = await response.json();
      if (response.status() !== 200) console.error('Release PO failed:', body);
      doId = body.data.delivery_order.id;

      response = await apiContext.post(`/api/purchase-order/release/${servicePoId}`, {
        data: {
          notes: 'Release WO',
          serviceOrder: { receivedBy: 'E2E Recv', startDate: '2026-06-03', endDate: '2026-06-05' },
          poc: { compiled: 'E2E Comp', approver: 'E2E Appr', headOfService: 'E2E Head' },
          units: [{ quantity: 1, unitType: 'Test', jobDescriptions: 'Job' }]
        }
      });
      body = await response.json();
      if (response.status() !== 200) console.error('Release Service PO failed:', body);
      woId = body.data.work_order.id;

      expect(poId).toBeDefined();
      expect(piId).toBeDefined();
      expect(doId).toBeDefined();
      expect(woId).toBeDefined();
    });

    // NOTE: PO update maps only camelCase keys (purchaseOrderNumber, paymentDue, ...).
    // The previous snake_case payload was silently ignored (a 200 no-op) — the read-back
    // below would have stayed at the old number. Using the correct camelCase keys here.
    test('ORD-EXT-002: Update Purchase Order (read-back number)', async () => {
      expect(poId).toBeDefined();
      const newNumber = `PO-UPD-${Date.now()}`;
      const response = await apiContext.put(`/api/purchase-order/${poId}`, {
        data: {
          paymentDue: '2026-12-31',
          purchaseOrderDate: '2026-01-01',
          purchaseOrderNumber: newNumber
        }
      });
      expect(response.status()).toBe(200);

      // Read-back: the mutated purchase_order_number must persist.
      const getBody = await (await apiContext.get(`/api/purchase-order/${poId}`)).json();
      expect(getBody.data.purchase_order_number).toBe(newNumber);
    });

    test('ORD-EXT-003: Update Proforma Invoice (read-back down_payment)', async () => {
      expect(piId).toBeDefined();
      const response = await apiContext.put(`/api/proforma-invoice/${piId}`, {
        data: {
          downPayment: 77000
        }
      });
      expect(response.status()).toBe(200);
      // The update endpoint echoes the persisted down_payment.
      const body = await response.json();
      expect(Number(body.data.down_payment)).toBe(77000);
    });

    test('ORD-EXT-004: Update Delivery Order (read-back ship_mode)', async () => {
      expect(doId).toBeDefined();
      const response = await apiContext.put(`/api/delivery-order/${doId}`, {
        data: {
          shipMode: 'Air',
          orderType: 'Express'
        }
      });
      expect(response.status()).toBe(200);

      // Read-back: the mutated ship_mode must persist (detail nests it under delivery_order).
      const getBody = await (await apiContext.get(`/api/delivery-order/${doId}`)).json();
      expect(getBody.data.delivery_order.ship_mode).toBe('Air');
    });

    // NOTE (reported): WorkOrderController@update maps work_order_number => null when the
    // key is absent, so its 'sometimes|required' rule always fires and a WO update without
    // workOrderNumber 422s. A client must always resend the number — so we do here.
    test('ORD-EXT-005: Update Work Order (read-back worker)', async () => {
      expect(woId).toBeDefined();
      const response = await apiContext.put(`/api/work-order/${woId}`, {
        data: {
          workOrderNumber: `WO-UPD-${Date.now()}`,
          worker: 'Updated Worker'
        }
      });
      expect(response.status()).toBe(200);

      // Read-back: the mutated worker must persist (detail nests it under poc).
      const getBody = await (await apiContext.get(`/api/work-order/${woId}`)).json();
      expect(getBody.data.poc.worker).toBe('Updated Worker');
    });
  });
});
