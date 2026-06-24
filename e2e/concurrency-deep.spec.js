import { test, expect } from '@playwright/test';
import fs from 'fs';

/**
 * Deeper concurrency. stock-concurrency.spec.js covers the 2-way moveToPo race; this adds
 * N-way races, concurrent Buy-receive increments, and a cross-operation race (decrement via
 * release racing increment via Buy-receive on the SAME part). All rely on the lockForUpdate
 * serialization in SparepartStockService — no lost updates.
 */
test.describe('Deep Concurrency / Stock Race Tests', () => {
  let api;
  let partId;
  const branchId = 1;

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
    partId = (await (await api.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0].id;
  });

  test.afterAll(async () => { await api.dispose(); });

  const customer = { companyName: 'PT Race', address: 'A', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S' };

  async function stock() {
    const d = (await (await api.get(`/api/sparepart/${partId}`)).json()).data;
    const b = (d.stocks ?? []).find((x) => x.branch_id === branchId);
    return b ? Number(b.quantity) : 0;
  }

  async function approvedQuotation(name, qty) {
    const q = (await (await api.post('/api/quotation', {
      data: { project: { type: 'Spareparts' }, customer: { ...customer, companyName: name }, price: { amount: qty * 50000 }, spareparts: [{ sparepartId: partId, quantity: qty, unitPriceSell: 50000 }] },
    })).json()).data;
    await api.post(`/api/quotation/approve/${q.slug}`, { data: { notes: 'a', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    return q.slug;
  }

  async function receivedBuy(qty) {
    const buy = (await (await api.post('/api/buy', {
      data: { totalAmount: qty * 1000, notes: 'race', branch: 'Jakarta', spareparts: [{ sparepartId: partId, quantity: qty, unitPriceBuy: 1000 }] },
    })).json()).data;
    await api.post(`/api/buy/approve/${buy.id}`, { data: { notes: 'a', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    return buy.id;
  }

  test('CONC-001: five concurrent moveToPo decrements apply with no lost update', async () => {
    const qtys = [1, 2, 3, 4, 5];
    const initial = await stock();
    expect(initial).toBeGreaterThanOrEqual(15); // guaranteed part has ample stock

    const slugs = [];
    for (let i = 0; i < qtys.length; i++) slugs.push(await approvedQuotation(`PT Race N${i}-${Date.now()}`, qtys[i]));

    const results = await Promise.all(slugs.map((s, i) => api.post(`/api/quotation/moveToPo/${s}`, { data: { notes: 'po', poNumber: `PO-CONC1-${Date.now()}-${i}` } })));
    for (const r of results) {
      if(r.status() !== 200) {
        const body = await r.json();
        fs.writeFileSync('e2e-error.json', JSON.stringify(body, null, 2));
      }
      expect(r.status()).toBe(200);
    }

    const after = await stock();
    // No lost update: total decrement equals the sum of all ordered quantities.
    expect(initial - after).toBe(qtys.reduce((a, b) => a + b, 0));
  });

  test('CONC-002: concurrent Buy receives apply every increment with no lost update', async () => {
    const qtys = [2, 3, 5];
    const initial = await stock();
    const buyIds = [];
    for (const q of qtys) buyIds.push(await receivedBuy(q));

    const results = await Promise.all(buyIds.map((id) => api.post(`/api/buy/done/${id}`, { data: { notes: 'recv', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } })));
    for (const r of results) expect(r.status()).toBe(200);

    const after = await stock();
    // No lost update: total increment equals the sum of all received quantities.
    expect(after - initial).toBe(qtys.reduce((a, b) => a + b, 0));
  });

  test('CONC-003: a decrement (moveToPo) racing an increment (Buy receive) nets correctly', async () => {
    const decQty = 4;
    const incQty = 6;
    const initial = await stock();
    expect(initial).toBeGreaterThanOrEqual(decQty);

    const slug = await approvedQuotation(`PT Race Cross-${Date.now()}`, decQty);
    const buyId = await receivedBuy(incQty);

    const [decRes, incRes] = await Promise.all([
      api.post(`/api/quotation/moveToPo/${slug}`, { data: { notes: 'po', poNumber: `PO-CONC3-${Date.now()}` } }),
      api.post(`/api/buy/done/${buyId}`, { data: { notes: 'recv', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } }),
    ]);
    if(decRes.status() !== 200) fs.writeFileSync('e2e-error3.json', JSON.stringify(await decRes.json(), null, 2));
    expect(decRes.status()).toBe(200);
    expect(incRes.status()).toBe(200);

    // Net effect: -decQty + incQty, regardless of interleaving (both locked).
    const after = await stock();
    expect(after - initial).toBe(incQty - decQty);
  });
});
