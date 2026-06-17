# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: guards-buy.spec.js >> BuyController Guards — negative-path & authz >> GUARD-BUY-010: ALLOW — Inventory Purchase POST buy/needChange is NOT 403
- Location: e2e\guards-buy.spec.js:134:3

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not 403
```

# Test source

```ts
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
  77  |     expect(res.status()).toBe(404);
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
> 139 |     expect(res.status()).not.toBe(403);
      |                              ^ Error: expect(received).not.toBe(expected) // Object.is equality
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
  178 |     const res = await api.delete(`/api/buy/${MISSING_ID}`);
  179 |     expect(res.status()).toBe(403);
  180 |     await api.dispose();
  181 |   });
  182 | 
  183 |   test('GUARD-BUY-015: DELETE buy with non-existent id → 404 (Buy::find returns null)', async () => {
  184 |     const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
  185 |     const res = await api.delete(`/api/buy/${MISSING_ID}`);
  186 |     expect(res.status()).toBe(404);
  187 |     await api.dispose();
  188 |   });
  189 | 
  190 |   // ALLOW-case for DELETE is intentionally a 404-not-403 probe, NOT a real deletion: destroy()
  191 |   // is destructive (removes detail_buys then the buy) and these guards must not mutate seed data.
  192 |   // A non-existent id still proves the role passes the guard (reaches the handler → 404, not 403).
  193 |   test('GUARD-BUY-016: ALLOW — Inventory Purchase DELETE buy reaches handler (404, not 403)', async () => {
  194 |     const api = await ctxFor('indah.s@bmj.com'); // Inventory Purchase — authorized
  195 |     const res = await api.delete(`/api/buy/${MISSING_ID}`);
  196 |     expect(res.status()).not.toBe(403);
  197 |     expect(res.status()).not.toBe(401);
  198 |     expect(res.status()).toBe(404);
  199 |     await api.dispose();
  200 |   });
  201 | });
  202 | 
```