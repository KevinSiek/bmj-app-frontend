import { test, expect } from '@playwright/test';

/**
 * Per-field validation for endpoints that need a real target record (PO/DO/WO/PI) and/or
 * return 400 instead of 422 (manual Validator::make in the controller). Each describe block
 * builds its target once, then breaks one field at a time.
 *
 * Expected codes (verified): PUT /purchase-order/{id} → 400, PUT /delivery-order/{id} → 400,
 * PUT /work-order/{id} → 422, PUT /proforma-invoice/{id} → 422, quotation return → 422.
 */
function deepClone(o) { return JSON.parse(JSON.stringify(o)); }
function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (value === '__DELETE__') delete cur[last];
  else cur[last] = value;
  return obj;
}
const DEL = '__DELETE__';

test.describe('Per-Field Validation — Target-Bound Endpoints', () => {
  let api;
  let sparepartId;

  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    const token = (await (await ctx.post('/api/login', {
      data: { email: 'director.smg@bmj.com', password: 'password' },
    })).json()).access_token;
    expect(token).toBeDefined();
    await ctx.dispose();
    api = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    sparepartId = (await (await api.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0].id;
  });

  test.afterAll(async () => { await api.dispose(); });

  const customer = { companyName: 'PT VMT', address: 'A', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S' , npwp: '123', email: 'e2e@bmj.com' };

  async function makePO() {
    const q = (await (await api.post('/api/quotation', {
      data: { project: { type: 'Spareparts' }, customer, price: { amount: 50000 }, spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 50000 }] },
    })).json()).data;
    await api.post(`/api/quotation/approve/${q.slug}`, { data: { notes: 'a', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    const po = (await (await api.post(`/api/quotation/moveToPo/${q.slug}`, { data: { notes: 'po', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } })).json()).data;
    return { quotationSlug: q.slug, poId: po.id };
  }

  // ---- PUT /purchase-order/{id} → 400 (camelCase keys) ----
  test.describe('PO update validation (400)', () => {
    const base = { paymentDue: '2026-12-31', purchaseOrderDate: '2026-01-01' };
    const fields = [
      ['quotationId', [999999, 'abc']],
      ['purchaseOrderDate', ['not-a-date', '2024-13-45']],
      ['paymentDue', ['not-a-date', 'hello']],
      ['employeeId', [999999, 'abc']],
      ['currentStatus', ['Done', 'Rejected', 'Shipped']], // Done/Rejected excluded from PO update enum
    ];
    let poId;
    test.beforeAll(async () => { poId = (await makePO()).poId; });
    for (const [field, invalids] of fields) {
      for (const inv of invalids) {
        test(`VMT PO-update · ${field}=${JSON.stringify(inv)} → 400`, async () => {
          const payload = setPath(deepClone(base), field, inv);
          expect((await api.put(`/api/purchase-order/${poId}`, { data: payload })).status()).toBe(400);
        });
      }
    }
  });

  // ---- PUT /proforma-invoice/{id} → 422 (downPayment camelCase) ----
  test.describe('PI update validation (422)', () => {
    let piId;
    test.beforeAll(async () => {
      const { poId } = await makePO();
      piId = (await (await api.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'pi', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } })).json()).data.id;
    });
    for (const inv of [DEL, '', -5, 'abc']) {
      const label = inv === DEL ? 'missing' : JSON.stringify(inv);
      test(`VMT PI-update · downPayment=${label} → 422`, async () => {
        const payload = inv === DEL ? {} : { downPayment: inv };
        expect((await api.put(`/api/proforma-invoice/${piId}`, { data: payload })).status()).toBe(422);
      });
    }
  });

  // ---- PUT /delivery-order/{id} → 400 ----
  test.describe('DO update validation (400)', () => {
    let doId;
    test.beforeAll(async () => {
      const { poId } = await makePO();
      await api.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'pi', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      await api.post(`/api/purchase-order/ready/${poId}`, { data: { notes: 'rdy', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      const rel = await api.post(`/api/purchase-order/release/${poId}`, {
        data: { deliveryOrder: { deliveryOrderDate: '2026-06-06', pickedBy: 'C', shipMode: 'Land', orderType: 'N' }, notes: 'r' },
      });
      doId = (await rel.json()).data.delivery_order.id;
    });
    const fields = [
      ['currentStatus', ['on progress', 'DONE', 'Completed']], // Rule::in(["On Progress","Done"])
      ['deliveryOrderDate', ['not-a-date', '2026-13-45']],
    ];
    for (const [field, invalids] of fields) {
      for (const inv of invalids) {
        test(`VMT DO-update · ${field}=${JSON.stringify(inv)} → 400`, async () => {
          const payload = setPath({}, field, inv);
          expect((await api.put(`/api/delivery-order/${doId}`, { data: payload })).status()).toBe(400);
        });
      }
    }
  });

  // ---- PUT /work-order/{id} → 422 (camelCase; workOrderNumber must accompany) ----
  test.describe('WO update validation (422)', () => {
    let woId;
    test.beforeAll(async () => {
      // Service quotation → PO → PI → DP paid → release → WO.
      const q = (await (await api.post('/api/quotation', {
        data: { project: { type: 'Service' }, customer, price: { amount: 5000000 }, services: [{ service: 'Repair', unitPriceSell: 5000000, quantity: 1 }] },
      })).json()).data;
      await api.post(`/api/quotation/approve/${q.slug}`, { data: { notes: 'a', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      const po = (await (await api.post(`/api/quotation/moveToPo/${q.slug}`, { data: { notes: 'po', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } })).json()).data;
      const pi = (await (await api.post(`/api/purchase-order/moveToPi/${po.id}`, { data: { notes: 'pi', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } })).json()).data;
      await api.post(`/api/proforma-invoice/dpPaid/${pi.id}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
      const rel = await api.post(`/api/purchase-order/release/${po.id}`, {
        data: {
          serviceOrder: { receivedBy: 'R', startDate: '2026-06-06', endDate: '2026-06-10' },
          poc: { compiled: 'C', approver: 'A', headOfService: 'H', worker: 'W' },
          additional: { scope: 'S' }, units: [{ jobDescriptions: 'J', unitType: 'U', quantity: 1 }],
          date: { startDate: '2026-06-06', endDate: '2026-06-10' }, description: 'd',
        },
      });
      woId = (await rel.json()).data.work_order.id;
    });
    // workOrderNumber must be present (else 'sometimes|required' fires). Break individual fields.
    const fields = [
      ['expectedStartDate', ['not-a-date', '2024-13-45']],
      ['startDate', ['not-a-date', '2024-02-31']],
      ['worker', [12345, 'x'.repeat(256)]],
    ];
    for (const [field, invalids] of fields) {
      for (const inv of invalids) {
        test(`VMT WO-update · ${field}=${JSON.stringify(inv).slice(0, 30)} → 422`, async () => {
          const payload = setPath({ workOrderNumber: `WO-VMT-${Date.now()}` }, field, inv);
          expect((await api.put(`/api/work-order/${woId}`, { data: payload })).status()).toBe(422);
        });
      }
    }
  });

  // ---- POST /quotation/return/{poId} → 422 (snake_case nested keys) ----
  test.describe('quotation return validation (422)', () => {
    let poId;
    test.beforeAll(async () => { poId = (await makePO()).poId; });
    const fields = [
      ['returned', [DEL, 'x', 123]],
      ['returned.0.sparepart_id', [999999, 1.5]],
      ['returned.0.quantity', [0, -1]],
    ];
    for (const [field, invalids] of fields) {
      for (const inv of invalids) {
        const label = inv === DEL ? 'missing' : JSON.stringify(inv);
        test(`VMT return · ${field}=${label} → 422`, async () => {
          const base = { returned: [{ sparepart_id: sparepartId, quantity: 1 }], notes: 'r' };
          const payload = setPath(deepClone(base), field, inv);
          expect((await api.post(`/api/quotation/return/${poId}`, { data: payload })).status()).toBe(422);
        });
      }
    }
  });
});
