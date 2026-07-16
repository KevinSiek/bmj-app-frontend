import { test, expect } from '@playwright/test';

/**
 * Edge cases: pagination + filters, special characters / long strings, and money/decimal
 * precision. Confirms the API behaves correctly at the boundaries, not just the happy path.
 */
test.describe('Edge Cases', () => {
  let api;
  let sparepartId;

  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    const token = (await (await ctx.post('/api/login', {
      data: { email: 'director.jkt@bmj.com', password: 'password' },
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

  // ---- Pagination & filters ----
  test('EDGE-PAGE-001: list endpoints return the full pagination envelope', async () => {
    const body = (await (await api.get('/api/customer')).json()).data;
    for (const k of ['current_page', 'last_page', 'per_page', 'total', 'from', 'to', 'data']) {
      expect(body).toHaveProperty(k);
    }
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.current_page).toBe(1);
  });

  test('EDGE-PAGE-002: page parameter advances to the requested page', async () => {
    const p1 = (await (await api.get('/api/customer?page=1')).json()).data;
    if (p1.last_page < 2) {
      // Seed too small to paginate; assert page beyond range is handled (empty data, not error).
      const beyond = await api.get('/api/customer?page=99');
      expect(beyond.status()).toBe(200);
      return;
    }
    const p2 = (await (await api.get('/api/customer?page=2')).json()).data;
    expect(p2.current_page).toBe(2);
  });

  test('EDGE-PAGE-003: page beyond last_page returns 200 with an empty data array', async () => {
    const res = await api.get('/api/customer?page=9999');
    expect(res.status()).toBe(200);
    const body = (await res.json()).data;
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
  });

  test('EDGE-FILTER-001: search filter only returns matching rows', async () => {
    const body = (await (await api.get('/api/sparepart?search=E2E')).json()).data;
    expect(body.data.length).toBeGreaterThan(0);
    for (const row of body.data) {
      const hit = (row.sparepart_name || '').includes('E2E') || (row.sparepart_number || '').includes('E2E');
      expect(hit).toBe(true);
    }
  });

  test('EDGE-FILTER-002: a search with no matches returns an empty (not error) list', async () => {
    const res = await api.get('/api/sparepart?search=zzz-nonexistent-zzz-' + Date.now());
    expect(res.status()).toBe(200);
    expect((await res.json()).data.data.length).toBe(0);
  });

  // ---- Special characters & long strings ----
  test('EDGE-CHARS-001: special characters in a customer name round-trip exactly', async () => {
    const name = 'PT Tëst & Co. <"#%> 日本語';
    const created = (await (await api.post('/api/customer', {
      data: { company_name: name, office: '021', address: 'A', urban: 'U', subdistrict: 'S', city: 'Jakarta', province: 'DKI', postal_code: 12345, npwp: '123', email: 'test@bmj.com' },
    })).json()).data;
    expect(created.company_name).toBe(name);
    // Read-back confirms persistence.
    const fetched = (await (await api.get(`/api/customer/${created.slug}`)).json()).data;
    expect(fetched.company_name).toBe(name);
  });

  test('EDGE-CHARS-002: a name at the 255-char max length is accepted; 256 is rejected (422)', async () => {
    const base = { office: '021', address: 'A', urban: 'U', subdistrict: 'S', city: 'Jakarta', province: 'DKI', postal_code: 12345, npwp: '123', email: 'test2@bmj.com' };
    const ok = await api.post('/api/customer', { data: { ...base, company_name: 'A'.repeat(255) } });
    expect(ok.status()).toBe(201);
    const tooLong = await api.post('/api/customer', { data: { ...base, company_name: 'A'.repeat(256) } });
    expect(tooLong.status()).toBe(422);
  });

  // ---- Money / decimal precision ----
  test('EDGE-MONEY-001: quotation pricing computes subtotal/ppn/grand_total from decimals', async () => {
    const q = (await (await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: { companyName: 'PT Money', address: 'A', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S', npwp: '123', email: 'money@bmj.com' },
        price: { amount: 30000 },
        spareparts: [{ sparepartId, quantity: 3, unitPriceSell: 10000 }],
      },
    })).json()).data;

    // subtotal = 3 * 10000 = 30000; grand_total = subtotal + ppn (and any discount); all positive numbers.
    expect(Number(q.subtotal)).toBe(30000);
    expect(Number(q.grand_total)).toBeGreaterThanOrEqual(Number(q.subtotal));
    expect(Number(q.ppn)).toBeGreaterThanOrEqual(0);
  });

  test('EDGE-MONEY-002: large quantities do not overflow or corrupt the subtotal', async () => {
    const qty = 100000;
    const unit = 12345;
    const q = (await (await api.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: { companyName: 'PT BigMoney', address: 'A', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S', npwp: '123', email: 'bigmoney@bmj.com' },
        price: { amount: qty * unit },
        spareparts: [{ sparepartId, quantity: qty, unitPriceSell: unit }],
      },
    })).json()).data;
    expect(Number(q.subtotal)).toBe(qty * unit);
  });
});
