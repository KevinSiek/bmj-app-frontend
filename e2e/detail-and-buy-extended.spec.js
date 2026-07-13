import { test, expect } from '@playwright/test';

/**
 * Covers previously-untested endpoints:
 *   - PUT    /api/buy/{id}                (update — read-back via notes)
 *   - DELETE /api/buy/{id}               (destroy)
 *   - GET    /api/buy/review/{flag}      (isNeedReview list)
 *   - GET    /api/work-order/{id}        (detail)
 *   - GET    /api/delivery-order/{id}    (detail)
 *   - GET    /api/back-order/{id}        (detail)
 *   - GET    /api/employee/access/{slug} (getEmployeeAccess)
 *
 * NOTE: the seeders create 0 work_orders / delivery_orders / back_orders, so the
 * detail tests build their own records by driving the PO release / back-order
 * pipeline (an indent order produces a Back Order; release produces a DO; a
 * service release produces a WO).
 *
 * NOTE: BuyController's PUT/GET response recomputes `total_amount` from line items
 * and hardcodes `notes` to '' in the PUT body, so read-back is asserted via the
 * GET endpoint's `notes` field (which is faithful). The DB column itself persists
 * total_amount correctly; the response shape just doesn't reflect it.
 */
test.describe('Detail + Buy Extended API Tests', () => {
  let api;
  let sparepartId;
  let lowStockSparepartId;

  async function director(playwright) {
    const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    const res = await ctx.post('/api/login', {
      data: { email: 'director.smg@bmj.com', password: 'password' },
    });
    const body = await res.json();
    expect(body.access_token).toBeDefined();
    await ctx.dispose();
    return playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}`, Accept: 'application/json' },
    });
  }

  async function createBuy(notes, qty = 5, unitPriceBuy = 10000) {
    const res = await api.post('/api/buy', {
      data: {
        totalAmount: qty * unitPriceBuy,
        notes,
        branch: 'Jakarta',
        spareparts: [{ sparepartId, quantity: qty, unitPriceBuy }],
      },
    });
    const body = await res.json();
    expect(res.status()).toBe(201);
    return body.data.id;
  }

  // Drive quotation → approve → PO → PI (+optionally pay DP), returning ids.
  async function createPOWithPI(companyName, partId, qty, type = 'Spareparts', payDp = false) {
    let res = await api.post('/api/quotation', {
      data: {
        project: { type },
        customer: {
          companyName, address: 'Jl. T', city: 'Jakarta', province: 'DKI Jakarta',
          postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
        },
        price: { amount: qty * 50000 },
        spareparts: [{ sparepartId: partId, quantity: qty, unitPriceSell: 50000 }],
      },
    });
    let body = await res.json();
    expect(res.status()).toBe(201);
    const quotationSlug = body.data.slug;

    await api.post(`/api/quotation/approve/${quotationSlug}`, { data: { notes: 'Approve', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    res = await api.post(`/api/quotation/moveToPo/${quotationSlug}`, { data: { notes: 'Move to PO', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    body = await res.json();
    expect(res.status()).toBe(200);
    const poId = body.data.id;

    res = await api.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'PI', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    const piId = (await res.json()).data?.id;
    if (payDp && piId) {
      await api.post(`/api/proforma-invoice/dpPaid/${piId}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    }
    return { poId, piId, quotationSlug };
  }

  // Goods release → Delivery Order (PI required; DP not required).
  async function releaseDO(poId) {
    return api.post(`/api/purchase-order/release/${poId}`, {
      data: {
        deliveryOrder: { deliveryOrderDate: '2026-06-06', pickedBy: 'C', shipMode: 'Land', orderType: 'Normal' },
        notes: 'Release',
      },
    });
  }

  // Service release → Work Order (PI + DP paid required; full service payload).
  async function releaseWO(poId) {
    return api.post(`/api/purchase-order/release/${poId}`, {
      data: {
        serviceOrder: { receivedBy: 'R', startDate: '2026-06-06', endDate: '2026-06-10' },
        poc: { compiled: 'C', approver: 'A', headOfService: 'H', worker: 'W' },
        additional: { scope: 'Overhaul' },
        units: [{ jobDescriptions: 'Engine repair', unitType: 'Generator', quantity: 1 }],
        date: { startDate: '2026-06-06', endDate: '2026-06-10' },
        description: 'Service release',
      },
    });
  }

  test.beforeAll(async ({ playwright }) => {
    api = await director(playwright);
    const spBody = await (await api.get('/api/sparepart?search=E2E+Guaranteed')).json();
    sparepartId = spBody.data.data[0].id;
    expect(sparepartId).toBeDefined();
    const lowBody = await (await api.get('/api/sparepart?search=E2E+Low')).json();
    lowStockSparepartId = lowBody.data?.data?.[0]?.id ?? sparepartId;
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test('DBE-API-001: Buy update persists notes (read-back)', async () => {
    const buyId = await createBuy('Buy to update');
    const res = await api.put(`/api/buy/${buyId}`, { data: { totalAmount: 999000, notes: 'Updated notes' } });
    expect(res.status()).toBe(200);
    const getBody = await (await api.get(`/api/buy/${buyId}`)).json();
    expect(getBody.data.notes).toBe('Updated notes');
  });

  test('DBE-API-002: Buy update validation rejects bad input (422)', async () => {
    const buyId = await createBuy('Buy bad update');
    const res = await api.put(`/api/buy/${buyId}`, { data: { totalAmount: 'not-a-number', review: 'not-a-bool' } });
    expect(res.status()).toBe(422);
  });

  // Regression guard for the BuyController@destroy FK-cascade fix: destroy now deletes
  // child detail_buys rows before the parent, so a Buy with line items deletes cleanly.
  // (Note: GET /api/buy/{id} on a missing id returns 500, not 404, because get() uses
  // findOrFail inside a try/catch — a separate pre-existing quirk — so we verify the
  // delete via the list no longer containing the id rather than the detail 404.)
  test('DBE-API-003: Buy delete removes the record (incl. line items)', async () => {
    const buyId = await createBuy('Buy to delete');
    const res = await api.delete(`/api/buy/${buyId}`);
    expect(res.status()).toBe(200);

    const listBody = await (await api.get('/api/buy')).json();
    const ids = (listBody.data.data || []).map((b) => b.id);
    expect(ids).not.toContain(buyId);
  });

  test('DBE-API-004: Buy review list responds with a paginated envelope', async () => {
    const res = await api.get('/api/buy/review/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data.data)).toBe(true);
  });

  test('DBE-API-005: Delivery Order detail endpoint (release a goods PO first)', async () => {
    const { poId } = await createPOWithPI('PT DBE DO', sparepartId, 1, 'Spareparts');
    const rel = await releaseDO(poId);
    expect(rel.status()).toBe(200);

    const listBody = await (await api.get('/api/delivery-order')).json();
    const first = listBody.data.data[0];
    expect(first?.id).toBeDefined();
    const res = await api.get(`/api/delivery-order/${first.id}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).data).toBeDefined();
  });

  test('DBE-API-006: Back Order detail endpoint (indent order produces a BO)', async () => {
    // Order more than available stock of the low-stock part → indent → Back Order at moveToPo.
    await createPOWithPI('PT DBE BO', lowStockSparepartId, 50, 'Spareparts');

    const listBody = await (await api.get('/api/back-order')).json();
    const first = listBody.data.data[0];
    expect(first?.id).toBeDefined();
    const res = await api.get(`/api/back-order/${first.id}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).data).toBeDefined();
  });

  test('DBE-API-007: Work Order detail endpoint (release a service PO first)', async () => {
    // Service quotations carry `services`, not `spareparts`.
    let res = await api.post('/api/quotation', {
      data: {
        project: { type: 'Service' },
        customer: {
          companyName: 'PT DBE WO', address: 'Jl. T', city: 'Jakarta', province: 'DKI Jakarta',
          postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
        },
        price: { amount: 5000000 },
        services: [{ service: 'E2E Engine Repair', unitPriceSell: 5000000, quantity: 1 }],
      },
    });
    expect(res.status()).toBe(201);
    const quotationSlug = (await res.json()).data.slug;
    await api.post(`/api/quotation/approve/${quotationSlug}`, { data: { notes: 'Approve', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    res = await api.post(`/api/quotation/moveToPo/${quotationSlug}`, { data: { notes: 'Move to PO', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    const poId = (await res.json()).data.id;
    res = await api.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'PI', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    const piId = (await res.json()).data?.id;
    await api.post(`/api/proforma-invoice/dpPaid/${piId}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });

    const rel = await releaseWO(poId);
    expect(rel.status()).toBe(200);

    const listBody = await (await api.get('/api/work-order')).json();
    const first = listBody.data.data[0];
    expect(first?.id).toBeDefined();
    res = await api.get(`/api/work-order/${first.id}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).data).toBeDefined();
  });

  test('DBE-API-008: Employee access endpoint returns the role access object', async () => {
    const empBody = await (await api.get('/api/employee')).json();
    const first = empBody.data.data[0];
    expect(first?.slug).toBeDefined();
    const res = await api.get(`/api/employee/access/${first.slug}`);
    expect(res.status()).toBe(200);
    // Response is the mapped access object directly: { path, name, feature }.
    const body = await res.json();
    expect(body.name).toBeTruthy();
    expect(Array.isArray(body.feature)).toBe(true);
  });
});
