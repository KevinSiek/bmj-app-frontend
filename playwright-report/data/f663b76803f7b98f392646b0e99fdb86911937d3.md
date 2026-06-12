# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stock-concurrency.spec.js >> Stock Concurrency / TOCTOU API Tests >> STKC-001: over-ordering floors branch stock at 0
- Location: e2e\stock-concurrency.spec.js:103:3

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:8000
Call log:
  - → POST http://localhost:8000/api/login
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 54

```

```
TypeError: Cannot read properties of undefined (reading 'dispose')
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Stock concurrency / TOCTOU. stock-math.spec.js proves the single-threaded happy-path
  5   |  * invariants; this fires concurrent stock-mutating transitions at the SAME low-stock part.
  6   |  *
  7   |  * Verified decrement point: stock decrements at moveToPo (quotation → PO), NOT at release.
  8   |  *
  9   |  * Stock is ALLOWED to go negative (QuotationController.php — raw `stock - ordered`): a
  10  |  * negative quantity IS the running indent (how many units the branch owes), and the same
  11  |  * shortfall is also tracked by the BackOrder. STKC-001 guards that over-ordering drives stock
  12  |  * negative by exactly the shortfall (it does NOT floor at 0).
  13  |  *
  14  |  * The decrement runs under lockForUpdate, so concurrent moveToPo calls are serialized with
  15  |  * NO lost update. STKC-002 guards that race property on a well-stocked part: the total drop
  16  |  * equals the sum of ordered quantities regardless of interleaving.
  17  |  */
  18  | test.describe('Stock Concurrency / TOCTOU API Tests', () => {
  19  |   let api;
  20  |   let lowPartId;
  21  |   const branchId = 1;
  22  | 
  23  |   async function director(playwright) {
  24  |     const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
  25  |     const res = await ctx.post('/api/login', { data: { email: 'director.jkt@bmj.com', password: 'password' } });
  26  |     const body = await res.json();
  27  |     expect(body.access_token).toBeDefined();
  28  |     await ctx.dispose();
  29  |     return playwright.request.newContext({
  30  |       baseURL: 'http://localhost:8000',
  31  |       extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}`, Accept: 'application/json' },
  32  |     });
  33  |   }
  34  | 
  35  |   async function stock() {
  36  |     const d = (await (await api.get(`/api/sparepart/${lowPartId}`)).json()).data;
  37  |     const b = (d.stocks ?? []).find((x) => x.branch_id === branchId);
  38  |     return b ? Number(b.quantity) : 0;
  39  |   }
  40  | 
  41  |   async function approvedQuotation(companyName, qty) {
  42  |     const res = await api.post('/api/quotation', {
  43  |       data: {
  44  |         project: { type: 'Spareparts', branch: 'Jakarta' },
  45  |         customer: {
  46  |           companyName, address: 'Jl. T', city: 'Jakarta', province: 'DKI Jakarta',
  47  |           postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
  48  |         },
  49  |         price: { amount: qty * 50000 },
  50  |         spareparts: [{ sparepartId: lowPartId, quantity: qty, unitPriceSell: 50000 }],
  51  |       },
  52  |     });
  53  |     const body = await res.json();
  54  |     expect(res.status()).toBe(201);
  55  |     await api.post(`/api/quotation/approve/${body.data.slug}`, { data: { notes: 'Approve', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  56  |     return body.data.slug;
  57  |   }
  58  | 
  59  |   // A well-stocked part for the no-lost-update race test (so both decrements stay positive,
  60  |   // isolating the lost-update property from the over-order/negative behavior).
  61  |   let guaranteedPartId;
  62  | 
  63  |   async function stockOf(partId) {
  64  |     const d = (await (await api.get(`/api/sparepart/${partId}`)).json()).data;
  65  |     const b = (d.stocks ?? []).find((x) => x.branch_id === branchId);
  66  |     return b ? Number(b.quantity) : 0;
  67  |   }
  68  | 
  69  |   async function approvedQuotationFor(partId, companyName, qty) {
  70  |     const res = await api.post('/api/quotation', {
  71  |       data: {
  72  |         project: { type: 'Spareparts', branch: 'Jakarta' },
  73  |         customer: {
  74  |           companyName, address: 'Jl. T', city: 'Jakarta', province: 'DKI Jakarta',
  75  |           postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
  76  |         },
  77  |         price: { amount: qty * 50000 },
  78  |         spareparts: [{ sparepartId: partId, quantity: qty, unitPriceSell: 50000 }],
  79  |       },
  80  |     });
  81  |     const body = await res.json();
  82  |     expect(res.status()).toBe(201);
  83  |     await api.post(`/api/quotation/approve/${body.data.slug}`, { data: { notes: 'Approve', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  84  |     return body.data.slug;
  85  |   }
  86  | 
  87  |   test.beforeAll(async ({ playwright }) => {
  88  |     api = await director(playwright);
  89  |     const low = (await (await api.get('/api/sparepart?search=E2E+Low')).json()).data.data[0];
  90  |     lowPartId = low.id;
  91  |     expect(lowPartId).toBeDefined();
  92  |     const guaranteed = (await (await api.get('/api/sparepart?search=E2E+Guaranteed')).json()).data.data[0];
  93  |     guaranteedPartId = guaranteed.id;
  94  |     expect(guaranteedPartId).toBeDefined();
  95  |   });
  96  | 
  97  |   test.afterAll(async () => {
> 98  |     await api.dispose();
      |               ^ TypeError: Cannot read properties of undefined (reading 'dispose')
  99  |   });
  100 | 
  101 |   // Over-ordering drives branch stock to 0 (it floors at 0).
  102 |   // The shortfall is tracked by the BackOrder.
  103 |   test('STKC-001: over-ordering floors branch stock at 0', async () => {
  104 |     const initial = await stock();
  105 |     // Order strictly more than whatever is available right now, by a known overshoot.
  106 |     const overshoot = 5;
  107 |     const order = Math.max(initial, 0) + overshoot;
  108 | 
  109 |     const slug = await approvedQuotation('PT Stock Negative', order);
  110 |     const res = await api.post(`/api/quotation/moveToPo/${slug}`, { data: { notes: 'PO negative', poNumber: `PO-NEG-${Date.now()}` } });
  111 |     expect(res.status()).toBe(200);
  112 | 
  113 |     const after = await stock();
  114 |     expect(after).toBe(0);
  115 |   });
  116 | 
  117 |   // The real race guard: two concurrent moveToPo calls on a well-stocked part each apply
  118 |   // their full decrement (lockForUpdate serializes them) — combined drop == sum of ordered
  119 |   // qty, no lost update. Uses the guaranteed-stock part so both decrements stay positive,
  120 |   // keeping this test about the race and not the over-order/negative path.
  121 |   test('STKC-002: concurrent moveToPo serialize with no lost update', async () => {
  122 |     const initial = await stockOf(guaranteedPartId);
  123 |     const qtyA = 3;
  124 |     const qtyB = 4;
  125 |     expect(initial).toBeGreaterThanOrEqual(qtyA + qtyB); // guaranteed part has ample stock
  126 | 
  127 |     const slugA = await approvedQuotationFor(guaranteedPartId, 'PT Concurrency A', qtyA);
  128 |     const slugB = await approvedQuotationFor(guaranteedPartId, 'PT Concurrency B', qtyB);
  129 | 
  130 |     const [resA, resB] = await Promise.all([
  131 |       api.post(`/api/quotation/moveToPo/${slugA}`, { data: { notes: 'PO A', poNumber: `PO-STKC2-A-${Date.now()}` } }),
  132 |       api.post(`/api/quotation/moveToPo/${slugB}`, { data: { notes: 'PO B', poNumber: `PO-STKC2-B-${Date.now()}` } }),
  133 |     ]);
  134 |     expect(resA.status()).toBe(200);
  135 |     expect(resB.status()).toBe(200);
  136 | 
  137 |     // No lost update: both decrements landed. Total drop == qtyA + qtyB exactly.
  138 |     const after = await stockOf(guaranteedPartId);
  139 |     expect(initial - after).toBe(qtyA + qtyB);
  140 |   });
  141 | });
  142 | 
```