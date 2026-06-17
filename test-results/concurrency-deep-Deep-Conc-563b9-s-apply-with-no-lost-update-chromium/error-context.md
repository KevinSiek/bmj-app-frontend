# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: concurrency-deep.spec.js >> Deep Concurrency / Stock Race Tests >> CONC-001: five concurrent moveToPo decrements apply with no lost update
- Location: e2e\concurrency-deep.spec.js:55:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
TimeoutError: apiRequestContext.post: Timeout 10000ms exceeded.
Call log:
  - → POST http://localhost:8000/api/quotation/moveToPo/quot4bmj-megahjkt1vi2026-GKGfby
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36
    - accept: application/json
    - accept-encoding: gzip,deflate,br
    - Authorization: Bearer 23|PeudwSsC3H27SQcMIsQlwQ9ATXD4C59tSXdkjLii21b228c4
    - content-type: application/json
    - content-length: 52

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import fs from 'fs';
  3   | 
  4   | /**
  5   |  * Deeper concurrency. stock-concurrency.spec.js covers the 2-way moveToPo race; this adds
  6   |  * N-way races, concurrent Buy-receive increments, and a cross-operation race (decrement via
  7   |  * release racing increment via Buy-receive on the SAME part). All rely on the lockForUpdate
  8   |  * serialization in SparepartStockService — no lost updates.
  9   |  */
  10  | test.describe('Deep Concurrency / Stock Race Tests', () => {
  11  |   let api;
  12  |   let partId;
  13  |   const branchId = 1;
  14  | 
  15  |   test.beforeAll(async ({ playwright }) => {
  16  |     const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
  17  |     const token = (await (await ctx.post('/api/login', {
  18  |       data: { email: 'director.jkt@bmj.com', password: 'password' },
  19  |     })).json()).access_token;
  20  |     expect(token).toBeDefined();
  21  |     await ctx.dispose();
  22  |     api = await playwright.request.newContext({
  23  |       baseURL: 'http://localhost:8000',
  24  |       extraHTTPHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  25  |     });
  26  |     partId = (await (await api.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0].id;
  27  |   });
  28  | 
  29  |   test.afterAll(async () => { await api.dispose(); });
  30  | 
  31  |   const customer = { companyName: 'PT Race', address: 'A', city: 'Jakarta', province: 'DKI', postalCode: '12345', office: '021', urban: 'U', subdistrict: 'S' };
  32  | 
  33  |   async function stock() {
  34  |     const d = (await (await api.get(`/api/sparepart/${partId}`)).json()).data;
  35  |     const b = (d.stocks ?? []).find((x) => x.branch_id === branchId);
  36  |     return b ? Number(b.quantity) : 0;
  37  |   }
  38  | 
  39  |   async function approvedQuotation(name, qty) {
  40  |     const q = (await (await api.post('/api/quotation', {
  41  |       data: { project: { type: 'Spareparts' }, customer: { ...customer, companyName: name }, price: { amount: qty * 50000 }, spareparts: [{ sparepartId: partId, quantity: qty, unitPriceSell: 50000 }] },
  42  |     })).json()).data;
  43  |     await api.post(`/api/quotation/approve/${q.slug}`, { data: { notes: 'a', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  44  |     return q.slug;
  45  |   }
  46  | 
  47  |   async function receivedBuy(qty) {
  48  |     const buy = (await (await api.post('/api/buy', {
  49  |       data: { totalAmount: qty * 1000, notes: 'race', branch: 'Jakarta', spareparts: [{ sparepartId: partId, quantity: qty, unitPriceBuy: 1000 }] },
  50  |     })).json()).data;
  51  |     await api.post(`/api/buy/approve/${buy.id}`, { data: { notes: 'a', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  52  |     return buy.id;
  53  |   }
  54  | 
  55  |   test('CONC-001: five concurrent moveToPo decrements apply with no lost update', async () => {
  56  |     const qtys = [1, 2, 3, 4, 5];
  57  |     const initial = await stock();
  58  |     expect(initial).toBeGreaterThanOrEqual(15); // guaranteed part has ample stock
  59  | 
  60  |     const slugs = [];
  61  |     for (let i = 0; i < qtys.length; i++) slugs.push(await approvedQuotation(`PT Race N${i}-${Date.now()}`, qtys[i]));
  62  | 
> 63  |     const results = await Promise.all(slugs.map((s, i) => api.post(`/api/quotation/moveToPo/${s}`, { data: { notes: 'po', poNumber: `PO-CONC1-${Date.now()}-${i}` } })));
      |                                                               ^ TimeoutError: apiRequestContext.post: Timeout 10000ms exceeded.
  64  |     for (const r of results) {
  65  |       if(r.status() !== 200) {
  66  |         const body = await r.json();
  67  |         fs.writeFileSync('e2e-error.json', JSON.stringify(body, null, 2));
  68  |       }
  69  |       expect(r.status()).toBe(200);
  70  |     }
  71  | 
  72  |     const after = await stock();
  73  |     // No lost update: total decrement equals the sum of all ordered quantities.
  74  |     expect(initial - after).toBe(qtys.reduce((a, b) => a + b, 0));
  75  |   });
  76  | 
  77  |   test('CONC-002: concurrent Buy receives apply every increment with no lost update', async () => {
  78  |     const qtys = [2, 3, 5];
  79  |     const initial = await stock();
  80  |     const buyIds = [];
  81  |     for (const q of qtys) buyIds.push(await receivedBuy(q));
  82  | 
  83  |     const results = await Promise.all(buyIds.map((id) => api.post(`/api/buy/done/${id}`, { data: { notes: 'recv', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } })));
  84  |     for (const r of results) expect(r.status()).toBe(200);
  85  | 
  86  |     const after = await stock();
  87  |     // No lost update: total increment equals the sum of all received quantities.
  88  |     expect(after - initial).toBe(qtys.reduce((a, b) => a + b, 0));
  89  |   });
  90  | 
  91  |   test('CONC-003: a decrement (moveToPo) racing an increment (Buy receive) nets correctly', async () => {
  92  |     const decQty = 4;
  93  |     const incQty = 6;
  94  |     const initial = await stock();
  95  |     expect(initial).toBeGreaterThanOrEqual(decQty);
  96  | 
  97  |     const slug = await approvedQuotation(`PT Race Cross-${Date.now()}`, decQty);
  98  |     const buyId = await receivedBuy(incQty);
  99  | 
  100 |     const [decRes, incRes] = await Promise.all([
  101 |       api.post(`/api/quotation/moveToPo/${slug}`, { data: { notes: 'po', poNumber: `PO-CONC3-${Date.now()}` } }),
  102 |       api.post(`/api/buy/done/${buyId}`, { data: { notes: 'recv', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } }),
  103 |     ]);
  104 |     if(decRes.status() !== 200) fs.writeFileSync('e2e-error3.json', JSON.stringify(await decRes.json(), null, 2));
  105 |     expect(decRes.status()).toBe(200);
  106 |     expect(incRes.status()).toBe(200);
  107 | 
  108 |     // Net effect: -decQty + incQty, regardless of interleaving (both locked).
  109 |     const after = await stock();
  110 |     expect(after - initial).toBe(incQty - decQty);
  111 |   });
  112 | });
  113 | 
```