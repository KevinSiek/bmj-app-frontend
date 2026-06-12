# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: order-flow-extended.spec.js >> Order Flow Extended API Tests >> OFE-API-002: getAllReturn returns a paginated list
- Location: e2e\order-flow-extended.spec.js:82:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Covers previously-untested order-flow endpoints:
  5   |  *   - POST /api/purchase-order/status/{id}   (updateStatus — manual status override)
  6   |  *   - GET  /api/purchase-order/return        (getAllReturn — return-filtered list)
  7   |  *   - POST /api/proforma-invoice/moveToInvoice/{id}
  8   |  *   - GET  /api/quotation/return/{isNeedReturn}  (isNeedReturn list filter)
  9   |  *   - GET  /api/quotation/rejectReturn/{slug}    (declineReturn)
  10  |  *
  11  |  * API-direct, mirroring stock-math/buy-extended: Director context drives the full
  12  |  * pipeline, then exercises each endpoint and read-back-verifies the persisted effect.
  13  |  */
  14  | test.describe('Order Flow Extended API Tests', () => {
  15  |   let api;
  16  |   let sparepartId;
  17  | 
  18  |   async function director(playwright) {
  19  |     const ctx = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
  20  |     const res = await ctx.post('/api/login', {
  21  |       data: { email: 'director.jkt@bmj.com', password: 'password' },
  22  |     });
  23  |     const body = await res.json();
  24  |     expect(body.access_token).toBeDefined();
  25  |     await ctx.dispose();
  26  |     return playwright.request.newContext({
  27  |       baseURL: 'http://localhost:8000',
  28  |       extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}`, Accept: 'application/json' },
  29  |     });
  30  |   }
  31  | 
  32  |   // Build a quotation → approve → PO, returning ids/slugs.
  33  |   async function createPO(companyName, qty = 1) {
  34  |     let res = await api.post('/api/quotation', {
  35  |       data: {
  36  |         project: { type: 'Spareparts' },
  37  |         customer: {
  38  |           companyName, address: 'Jl. Test', city: 'Jakarta', province: 'DKI Jakarta',
  39  |           postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
  40  |         },
  41  |         price: { amount: qty * 50000 },
  42  |         spareparts: [{ sparepartId, quantity: qty, unitPriceSell: 50000 }],
  43  |       },
  44  |     });
  45  |     let body = await res.json();
  46  |     expect(res.status()).toBe(201);
  47  |     const quotationSlug = body.data.slug;
  48  | 
  49  |     await api.post(`/api/quotation/approve/${quotationSlug}`, { data: { notes: 'Approve', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  50  |     res = await api.post(`/api/quotation/moveToPo/${quotationSlug}`, { data: { notes: 'Move to PO', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  51  |     body = await res.json();
  52  |     expect(res.status()).toBe(200);
  53  |     return { poId: body.data.id, quotationSlug };
  54  |   }
  55  | 
  56  |   test.beforeAll(async ({ playwright }) => {
  57  |     api = await director(playwright);
  58  |     const spRes = await api.get('/api/sparepart?search=E2E+Guaranteed');
  59  |     const spBody = await spRes.json();
  60  |     sparepartId = spBody.data?.data?.[0]?.id;
  61  |     expect(sparepartId).toBeDefined();
  62  |   });
  63  | 
  64  |   test.afterAll(async () => {
  65  |     await api.dispose();
  66  |   });
  67  | 
  68  |   test('OFE-API-001: PO updateStatus persists the new status', async () => {
  69  |     const { poId } = await createPO('PT OFE Status');
  70  | 
  71  |     const res = await api.post(`/api/purchase-order/status/${poId}`, { data: { status: 'Prepare' } });
  72  |     expect(res.status()).toBe(200);
  73  |     const body = await res.json();
  74  |     expect(body.data.current_status).toBe('Prepare');
  75  | 
  76  |     // Read-back via detail endpoint
  77  |     const getRes = await api.get(`/api/purchase-order/${poId}`);
  78  |     const getBody = await getRes.json();
  79  |     expect(getBody.data.current_status).toBe('Prepare');
  80  |   });
  81  | 
  82  |   test('OFE-API-002: getAllReturn returns a paginated list', async () => {
  83  |     const res = await api.get('/api/purchase-order/return');
> 84  |     expect(res.status()).toBe(200);
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  85  |     const body = await res.json();
  86  |     // Paginated envelope; data.data is the row array (may be empty if no returns yet)
  87  |     expect(body.data).toBeDefined();
  88  |     expect(Array.isArray(body.data.data)).toBe(true);
  89  |   });
  90  | 
  91  |   test('OFE-API-003: moveToInvoice creates an Invoice and blocks a second one', async () => {
  92  |     const { poId } = await createPO('PT OFE Invoice');
  93  | 
  94  |     // PO → PI
  95  |     let res = await api.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'Create PI', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  96  |     expect(res.status()).toBe(200);
  97  |     const piId = (await res.json()).data.id;
  98  |     expect(piId).toBeDefined();
  99  | 
  100 |     // PI → Invoice
  101 |     res = await api.post(`/api/proforma-invoice/moveToInvoice/${piId}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  102 |     expect(res.status()).toBe(200);
  103 |     const inv = (await res.json()).data;
  104 |     expect(inv.invoice_number).toBeTruthy();
  105 |     expect(inv.proforma_invoice_id).toBe(piId);
  106 | 
  107 |     // Second attempt is rejected (invoice already exists)
  108 |     res = await api.post(`/api/proforma-invoice/moveToInvoice/${piId}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  109 |     expect(res.status()).toBe(400);
  110 |   });
  111 | 
  112 |   test('OFE-API-004: isNeedReturn list endpoint responds', async () => {
  113 |     const res = await api.get('/api/quotation/return/1');
  114 |     expect(res.status()).toBe(200);
  115 |     const body = await res.json();
  116 |     expect(body.data).toBeDefined();
  117 |   });
  118 | 
  119 |   test('OFE-API-005: declineReturn on a non-return quotation is rejected (400)', async () => {
  120 |     // Create a fresh quotation that is NOT in a return state.
  121 |     const res = await api.post('/api/quotation', {
  122 |       data: {
  123 |         project: { type: 'Spareparts' },
  124 |         customer: {
  125 |           companyName: 'PT OFE DeclineReturn', address: 'Jl. T', city: 'Jakarta',
  126 |           province: 'DKI Jakarta', postalCode: '12345', office: '021-1', urban: 'U', subdistrict: 'S',
  127 |         },
  128 |         price: { amount: 50000 },
  129 |         spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 50000 }],
  130 |       },
  131 |     });
  132 |     const slug = (await res.json()).data.slug;
  133 | 
  134 |     // declineReturn requires is_return=true; on a normal quotation it must 400.
  135 |     const declineRes = await api.get(`/api/quotation/rejectReturn/${slug}`);
  136 |     expect(declineRes.status()).toBe(400);
  137 |   });
  138 | });
  139 | 
```