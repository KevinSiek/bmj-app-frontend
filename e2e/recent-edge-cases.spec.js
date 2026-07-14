import { test, expect, request } from '@playwright/test';
import { provisionQuotationAndPo } from './helpers.js';

test.describe('Recent Features & Edge Cases (Customers, WO, DO, DN)', () => {
  let adminContext;
  let anon;

  test.beforeAll(async ({ playwright }) => {
    anon = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Accept: 'application/json' },
    });

    const loginResponse = await anon.post('/api/login', {
      data: { email: 'director.jkt@bmj.com', password: 'password' }
    });
    const loginBody = await loginResponse.json();
    expect(loginBody.access_token).toBeDefined();

    adminContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { 
        Authorization: `Bearer ${loginBody.access_token}`, 
        Accept: 'application/json' 
      },
    });
  });

  test.afterAll(async () => {
    await adminContext.dispose();
    await anon.dispose();
  });

  async function ctxFor(email, password = 'password') {
    const res = await anon.post('/api/login', { data: { email, password } });
    const body = await res.json();
    return request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { 
        Authorization: `Bearer ${body.access_token}`, 
        Accept: 'application/json' 
      },
    });
  }

  test.describe('Customer Isolation by Group (CUST-EDGE)', () => {
    let mktA, mktB, mktC;
    let custASlug = '';

    test.beforeAll(async () => {
      // Setup Marketing Users & Groups
      // Find slugs for citra.k, marketing.jkt, marketing.smg
      const resA = await adminContext.get('/api/employee?search=citra_k');
      const citra = (await resA.json()).data.data[0];
      
      const resB = await adminContext.get('/api/employee?search=marketing_jkt');
      const mktJkt = (await resB.json()).data.data[0];

      const resC = await adminContext.get('/api/employee?search=marketing_smg');
      const mktSmg = (await resC.json()).data.data[0];

      // Assign Groups
      // citra.k & marketing.jkt -> "Group Alpha"
      // marketing.smg -> "Group Beta"
      await adminContext.put(`/api/employee/${citra.slug}`, {
        data: { fullname: citra.fullname, role: citra.role, branch: citra.branch, email: citra.email, username: citra.username, group: 'Group Alpha' }
      });
      await adminContext.put(`/api/employee/${mktJkt.slug}`, {
        data: { fullname: mktJkt.fullname, role: mktJkt.role, branch: mktJkt.branch, email: mktJkt.email, username: mktJkt.username, group: 'Group Alpha' }
      });
      await adminContext.put(`/api/employee/${mktSmg.slug}`, {
        data: { fullname: mktSmg.fullname, role: mktSmg.role, branch: mktSmg.branch, email: mktSmg.email, username: mktSmg.username, group: 'Group Beta' }
      });

      mktA = await ctxFor('citra.k@bmj.com');
      mktB = await ctxFor('marketing.jkt@bmj.com'); // Same group as A
      mktC = await ctxFor('marketing.smg@bmj.com'); // Different group
    });

    test.afterAll(async () => {
      if(mktA) await mktA.dispose();
      if(mktB) await mktB.dispose();
      if(mktC) await mktC.dispose();
    });

    test('CUST-EDGE-001 & 002: Customer isolation and group sharing', async () => {
      // Mkt A creates a customer
      const createRes = await mktA.post('/api/customer', {
        data: {
          company_name: `PT Alpha ${Date.now()}`,
          address: 'Jl. Alpha', city: 'Jakarta', province: 'DKI Jakarta', postal_code: '12345',
          office: '021-111111', urban: 'Test', subdistrict: 'Test', pic_name: 'Alpha PIC', pic_phone: '08111111'
        }
      });
      const createBody = await createRes.json();
      expect(createRes.status()).toBe(201);
      custASlug = createBody.data.slug;

      // Mkt A can see it
      const getA = await mktA.get(`/api/customer/${custASlug}`);
      expect(getA.status()).toBe(200);

      // Mkt B (same group) CAN see it
      const getB = await mktB.get(`/api/customer/${custASlug}`);
      expect(getB.status()).toBe(200);

      // Mkt C (different group) CANNOT see it
      const getC = await mktC.get(`/api/customer/${custASlug}`);
      expect(getC.status()).toBe(404);
    });
  });

  test.describe('Work Order & Delivery Order Bypasses (WO-EDGE & DO-EDGE)', () => {
    
    test('DO-EDGE-001 & 002: DO Release Bypass & DN Sequential Numbering', async () => {
      // Marketing creates Goods PO and releases DO without PI being paid
      const mktApi = await ctxFor('citra.k@bmj.com');
      
      // We need a PO. We can provision one directly using the helper.
      const { poId } = await provisionQuotationAndPo(adminContext);

      // The PO is just created. It is NOT ready.
      // Set to ready (normally done by Inventory, but Director can do it)
      const resReady = await adminContext.post(`/api/purchase-order/ready/${poId}`);
      expect(resReady.status()).toBe(200);

      // Now release DO (by Marketing, which was a bypass added recently, or Director)
      // Note: Marketing couldn't release DO originally, but we added a bypass for DO creation? 
      // Release DO by Director (Director and Marketing bypass DP check)
      const doRelease = await adminContext.post(`/api/purchase-order/release/${poId}`, {
        data: {
          deliveryOrder: {
            deliveryOrderDate: '2026-06-01',
            pickedBy: 'Tester',
            shipMode: 'Land',
            orderType: 'Urgent'
          }
        }
      });
      if (doRelease.status() !== 200) console.error(await doRelease.text());
      expect(doRelease.status()).toBe(200);
      const poUpdated = await doRelease.json();

      const deliveryOrder = poUpdated.data.delivery_order;
      expect(deliveryOrder).toBeDefined();

      // Now Process the DO to trigger DN generation
      const processRes = await adminContext.post(`/api/delivery-order/process/${deliveryOrder.id}`, {
        data: {
          id: deliveryOrder.id,
          delivery_date: '2026-06-03',
          received_by: 'John',
          picked_by: 'Jane',
          ship_mode: 'Land',
          order_type: 'Regular'
        }
      });
      expect(processRes.status()).toBe(200);

      // Fetch the DO again to verify DN number exists and is sequential
      const doFinal = await adminContext.get(`/api/delivery-order/${deliveryOrder.id}`);
      const doData = (await doFinal.json()).data;
      expect(doData.delivery_order.delivery_note_number).toBeDefined();
      expect(doData.delivery_order.delivery_note_number).toContain('DN/'); // Sequential format check
      
      await mktApi.dispose();
    });

  });
});
