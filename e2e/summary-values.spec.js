import { test, expect, request } from '@playwright/test';

/**
 * Summary VALUE assertions. access-summary.spec.js only checks these respond 200 with a data
 * object. Each role-summary only populates its counts when called BY THAT ROLE (the controller
 * gates on $user->role), so we log in as the matching seeded account and assert the real nested
 * count structure — plus a live-increment check that proves the numbers reflect actual data.
 */
test.describe('Role Summary — Value Assertions', () => {
  let anon;

  async function ctxFor(email) {
    const res = await anon.post('/api/login', { data: { email, password: 'password' } });
    const token = (await res.json()).access_token;
    expect(token, `login failed for ${email}`).toBeDefined();
    return request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
  }

  test.beforeAll(async ({ playwright }) => {
    anon = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Accept: 'application/json' },
    });
  });

  test.afterAll(async () => { await anon.dispose(); });

  test('SUMV-001: inventory summary (as Inventory Admin) returns numeric PO counts', async () => {
    const api = await ctxFor('inventory.admin.jkt@bmj.com'); // Inventory Admin
    const data = (await (await api.get('/api/summary/inventory')).json()).data;
    expect(data.purchase_order).toBeDefined();
    for (const k of ['total', 'prepare', 'ready', 'release']) {
      expect(typeof data.purchase_order[k]).toBe('number');
      expect(data.purchase_order[k]).toBeGreaterThanOrEqual(0);
    }
    // Sub-counts can never exceed the total.
    const po = data.purchase_order;
    expect(po.prepare + po.ready + po.release).toBeLessThanOrEqual(po.total);
    await api.dispose();
  });

  test('SUMV-002: finance summary (as Finance) returns numeric payment-state counts', async () => {
    const api = await ctxFor('finance.jkt@bmj.com'); // Finance
    const data = (await (await api.get('/api/summary/finance')).json()).data;
    expect(data.purchase_order).toBeDefined();
    for (const k of ['wait_for_payment', 'dp_paid', 'full_paid']) {
      expect(typeof data.purchase_order[k]).toBe('number');
      expect(data.purchase_order[k]).toBeGreaterThanOrEqual(0);
    }
    await api.dispose();
  });

  test('SUMV-003: service summary (as Service) returns numeric work-order counts', async () => {
    const api = await ctxFor('service.jkt@bmj.com'); // Service
    const data = (await (await api.get('/api/summary/service')).json()).data;
    expect(data.work_order).toBeDefined();
    for (const k of ['total', 'on_progress', 'done']) {
      expect(typeof data.work_order[k]).toBe('number');
      expect(data.work_order[k]).toBeGreaterThanOrEqual(0);
    }
    expect(data.work_order.on_progress + data.work_order.done).toBeLessThanOrEqual(data.work_order.total);
    await api.dispose();
  });

  test('SUMV-004: inventory PO total increments when a new PO is created (live value check)', async () => {
    // The summary counts only this month's POs; create one as Director, then read the count
    // as Inventory Admin and confirm it went up by exactly 1.
    const director = await ctxFor('director.jkt@bmj.com');
    const inv = await ctxFor('inventory.admin.jkt@bmj.com');

    const before = (await (await inv.get('/api/summary/inventory')).json()).data.purchase_order.total;

    const sp = (await (await director.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0];
    const q = (await (await director.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: { companyName: `PT SUMV ${Date.now()}`, address: 'A', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S' , npwp: '123', email: 'e2e@bmj.com' },
        price: { amount: 50000 },
        spareparts: [{ sparepartId: sp.id, quantity: 1, unitPriceSell: 50000 }],
      },
    })).json()).data;
    await director.post(`/api/quotation/approve/${q.slug}`, { data: { notes: 'a', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    const moved = await director.post(`/api/quotation/moveToPo/${q.slug}`, { data: { notes: 'po', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(moved.status()).toBe(200);

    const after = (await (await inv.get('/api/summary/inventory')).json()).data.purchase_order.total;
    expect(after).toBe(before + 1);

    await director.dispose();
    await inv.dispose();
  });
});
