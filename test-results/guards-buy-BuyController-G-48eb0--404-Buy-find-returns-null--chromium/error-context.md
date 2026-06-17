# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guards-buy.spec.js >> BuyController Guards — negative-path & authz >> GUARD-BUY-003: approve with non-existent id → 404 (Buy::find returns null)
- Location: e2e\guards-buy.spec.js:74:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 403
```

# Test source

```ts
  1   | import { test, expect, request } from '@playwright/test';
  2   | import { provisionBuy } from './helpers.js';
  3   | 
  4   | /**
  5   |  * Negative-path & authz coverage for the BuyController write surface.
  6   |  *
  7   |  * The buy/* prefix is wrapped in role:inventory_purchase,inventory,director (routes/api.php),
  8   |  * so every mutation must reject forbidden roles with 403 — a hidden UI button proves nothing
  9   |  * about the API a determined client can call directly. Each authz block pairs the forbidden
  10  |  * role (→403) with an ALLOW-case asserting an authorized role does NOT get 403, to rule out a
  11  |  * blanket-deny false positive (mirrors SECW-008).
  12  |  *
  13  |  * Negative-path: approve/reject/needChange/done/destroy all load the row via
  14  |  * Buy::lockForUpdate()->find($id) and fall through to handleNotFound('Purchase not found')
  15  |  * when it's null, returning 404. The 404 is asserted with a guaranteed-nonexistent id
  16  |  * (999999) because that is exactly the documented trigger in the findings.
  17  |  *
  18  |  * API-direct only — no UI. Findings are from reading app/Http/Controllers/BuyController.php.
  19  |  */
  20  | test.describe('BuyController Guards — negative-path & authz', () => {
  21  |   let anon;
  22  | 
  23  |   // Guaranteed-nonexistent id: the findings' negativeTrigger is Buy::find($id) === null.
  24  |   const MISSING_ID = 999999;
  25  | 
  26  |   test.beforeAll(async ({ playwright }) => {
  27  |     anon = await playwright.request.newContext({
  28  |       baseURL: 'http://localhost:8000',
  29  |       extraHTTPHeaders: { Accept: 'application/json' },
  30  |     });
  31  |   });
  32  | 
  33  |   test.afterAll(async () => {
  34  |     await anon.dispose();
  35  |   });
  36  | 
  37  |   async function ctxFor(email, password = 'password') {
  38  |     const res = await anon.post('/api/login', { data: { email, password } });
  39  |     const body = await res.json();
  40  |     expect(body.access_token).toBeDefined();
  41  |     return request.newContext({
  42  |       baseURL: 'http://localhost:8000',
  43  |       extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}`, Accept: 'application/json' },
  44  |     });
  45  |   }
  46  | 
  47  |   // Self-provision a real buy id for ALLOW-cases that need a row that actually exists (so a
  48  |   // non-403 outcome reflects authz, not a 404). Reads the list first; if the seeders left it
  49  |   // empty, creates a buy via the same role. Returns a valid id (never null) so the allow-cases
  50  |   // run instead of skipping. Throws if provisioning fails, surfacing a setup break loudly.
  51  |   async function firstBuyId(api) {
  52  |     const res = await api.get('/api/buy');
  53  |     if (res.status() === 200) {
  54  |       const rows = (await res.json())?.data?.data ?? [];
  55  |       if (rows.length) return rows[0].id;
  56  |     }
  57  |     return provisionBuy(api);
  58  |   }
  59  | 
  60  |   // ---- POST /api/buy/approve/{id} ------------------------------------------------------
  61  | 
  62  |   test('GUARD-BUY-001: Marketing cannot POST buy/approve (Inventory/Director-only) → 403', async () => {
  63  |     const api = await ctxFor('citra.k@bmj.com'); // Marketing — not in role:inventory_purchase,inventory,director
  64  |     const res = await api.post(`/api/buy/approve/${MISSING_ID}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  65  |     expect(res.status()).toBe(403);
  66  |     await api.dispose();
  67  |   });
  68  | 
  69  |   test('GUARD-BUY-002: Unauthenticated POST buy/approve → 401', async () => {
  70  |     const res = await anon.post(`/api/buy/approve/${MISSING_ID}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  71  |     expect(res.status()).toBe(401);
  72  |   });
  73  | 
  74  |   test('GUARD-BUY-003: approve with non-existent id → 404 (Buy::find returns null)', async () => {
  75  |     const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized, so 404 is the body guard, not authz
  76  |     const res = await api.post(`/api/buy/approve/${MISSING_ID}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
> 77  |     expect(res.status()).toBe(404);
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  78  |     await api.dispose();
  79  |   });
  80  | 
  81  |   test('GUARD-BUY-004: ALLOW — Inventory Purchase POST buy/approve is NOT 403', async () => {
  82  |     const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
  83  |     const id = await firstBuyId(api);
  84  |     test.skip(id === null, 'No buy rows seeded to exercise the allow-case');
  85  |     const res = await api.post(`/api/buy/approve/${id}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  86  |     // The role IS authorized — whatever the outcome (200 success, or a status guard), it must NOT be 403/401.
  87  |     expect(res.status()).not.toBe(403);
  88  |     expect(res.status()).not.toBe(401);
  89  |     await api.dispose();
  90  |   });
  91  | 
  92  |   // ---- POST /api/buy/reject/{id}  (maps to decline()) ----------------------------------
  93  | 
  94  |   test('GUARD-BUY-005: Finance cannot POST buy/reject (Inventory/Director-only) → 403', async () => {
  95  |     const api = await ctxFor('fajar.n@bmj.com'); // Finance — not authorized for buy/*
  96  |     const res = await api.post(`/api/buy/reject/${MISSING_ID}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  97  |     expect(res.status()).toBe(403);
  98  |     await api.dispose();
  99  |   });
  100 | 
  101 |   test('GUARD-BUY-006: reject with non-existent id → 404 (Buy::find returns null)', async () => {
  102 |     const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
  103 |     const res = await api.post(`/api/buy/reject/${MISSING_ID}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  104 |     expect(res.status()).toBe(404);
  105 |     await api.dispose();
  106 |   });
  107 | 
  108 |   test('GUARD-BUY-007: ALLOW — Director POST buy/reject is NOT 403', async () => {
  109 |     const api = await ctxFor('director.jkt@bmj.com'); // Director — authorized
  110 |     const id = await firstBuyId(api);
  111 |     test.skip(id === null, 'No buy rows seeded to exercise the allow-case');
  112 |     const res = await api.post(`/api/buy/reject/${id}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  113 |     expect(res.status()).not.toBe(403);
  114 |     expect(res.status()).not.toBe(401);
  115 |     await api.dispose();
  116 |   });
  117 | 
  118 |   // ---- POST /api/buy/needChange/{id} ---------------------------------------------------
  119 | 
  120 |   test('GUARD-BUY-008: Marketing cannot POST buy/needChange (Inventory/Director-only) → 403', async () => {
  121 |     const api = await ctxFor('citra.k@bmj.com'); // Marketing — not authorized for buy/*
  122 |     const res = await api.post(`/api/buy/needChange/${MISSING_ID}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  123 |     expect(res.status()).toBe(403);
  124 |     await api.dispose();
  125 |   });
  126 | 
  127 |   test('GUARD-BUY-009: needChange with non-existent id → 404 (Buy::find returns null)', async () => {
  128 |     const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
  129 |     const res = await api.post(`/api/buy/needChange/${MISSING_ID}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  130 |     expect(res.status()).toBe(404);
  131 |     await api.dispose();
  132 |   });
  133 | 
  134 |   test('GUARD-BUY-010: ALLOW — Inventory Purchase POST buy/needChange is NOT 403', async () => {
  135 |     const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
  136 |     const id = await firstBuyId(api);
  137 |     test.skip(id === null, 'No buy rows seeded to exercise the allow-case');
  138 |     const res = await api.post(`/api/buy/needChange/${id}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  139 |     expect(res.status()).not.toBe(403);
  140 |     expect(res.status()).not.toBe(401);
  141 |     await api.dispose();
  142 |   });
  143 | 
  144 |   // ---- POST /api/buy/done/{id} ---------------------------------------------------------
  145 | 
  146 |   test('GUARD-BUY-011: Service cannot POST buy/done (Inventory/Director-only) → 403', async () => {
  147 |     const api = await ctxFor('hadi.s@bmj.com'); // Service — not authorized for buy/*
  148 |     const res = await api.post(`/api/buy/done/${MISSING_ID}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  149 |     expect(res.status()).toBe(403);
  150 |     await api.dispose();
  151 |   });
  152 | 
  153 |   test('GUARD-BUY-012: done with non-existent id → 404 (Buy::find returns null, before branch resolution)', async () => {
  154 |     const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
  155 |     // find($id) === null returns 404 before ensureBuyBranchId() can throw — so this is a clean 404.
  156 |     const res = await api.post(`/api/buy/done/${MISSING_ID}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  157 |     expect(res.status()).toBe(404);
  158 |     await api.dispose();
  159 |   });
  160 | 
  161 |   test('GUARD-BUY-013: ALLOW — Director POST buy/done is NOT 403', async () => {
  162 |     const api = await ctxFor('director.jkt@bmj.com'); // Director — authorized
  163 |     const id = await firstBuyId(api);
  164 |     test.skip(id === null, 'No buy rows seeded to exercise the allow-case');
  165 |     const res = await api.post(`/api/buy/done/${id}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  166 |     // Authorized role: must not be 403/401. Note: done() can 500 via ensureBuyBranchId() if the
  167 |     // seeded buy has a null branch_id and a malformed buy_number (finding: line 684) — that is a
  168 |     // controller gap, not an authz failure, so we only assert it is not blocked by the role guard.
  169 |     expect(res.status()).not.toBe(403);
  170 |     expect(res.status()).not.toBe(401);
  171 |     await api.dispose();
  172 |   });
  173 | 
  174 |   // ---- DELETE /api/buy/{id} ------------------------------------------------------------
  175 | 
  176 |   test('GUARD-BUY-014: Finance cannot DELETE buy (Inventory/Director-only) → 403', async () => {
  177 |     const api = await ctxFor('fajar.n@bmj.com'); // Finance — not authorized for buy/*
```