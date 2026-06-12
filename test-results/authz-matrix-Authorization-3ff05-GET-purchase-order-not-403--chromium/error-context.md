# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authz-matrix.spec.js >> Authorization Matrix (role × route) >> AZ-OK service CAN GET purchase-order (not 403)
- Location: e2e\authz-matrix.spec.js:79:7

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not 403
```

# Test source

```ts
  1  | import { test, expect, request } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Full role × route authorization matrix. security-403.spec.js spot-checks a few pairs;
  5  |  * this systematically asserts that for every role-gated route group, each DISALLOWED role
  6  |  * gets 403, and an ALLOWED role does not. Derived from routes/api.php.
  7  |  *
  8  |  * Director is omitted from the disallowed set everywhere (RoleMiddleware bypass).
  9  |  */
  10 | 
  11 | // Seeded accounts (all password 'password').
  12 | const ROLES = {
  13 |   director: 'director.jkt@bmj.com',
  14 |   marketing: 'citra.k@bmj.com',
  15 |   finance: 'fajar.n@bmj.com',
  16 |   inventory_admin: 'eko.p@bmj.com',
  17 |   service: 'hadi.s@bmj.com',
  18 | };
  19 | 
  20 | // Route group → { probe (a cheap GET in the group), allowed roles } from routes/api.php.
  21 | // (purchase-order allows service too: Service releases Service-type POs into Work Orders.)
  22 | const GROUPS = [
  23 |   { name: 'quotation', probe: '/api/quotation', allowed: ['marketing', 'finance'] },
  24 |   { name: 'purchase-order', probe: '/api/purchase-order', allowed: ['marketing', 'finance', 'inventory_admin', 'service'] },
  25 |   { name: 'invoice', probe: '/api/invoice', allowed: ['finance'] },
  26 |   { name: 'proforma-invoice', probe: '/api/proforma-invoice', allowed: ['finance'] },
  27 |   { name: 'work-order', probe: '/api/work-order', allowed: ['service'] },
  28 |   { name: 'delivery-order', probe: '/api/delivery-order', allowed: ['inventory_admin'] },
  29 |   { name: 'back-order', probe: '/api/back-order', allowed: ['inventory_admin'] },
  30 |   { name: 'buy', probe: '/api/buy', allowed: [] }, // inventory_purchase/inventory only — none of our seeded non-director accounts qualify
  31 |   { name: 'employee', probe: '/api/employee', allowed: [] }, // director only
  32 |   { name: 'general', probe: '/api/general', allowed: [] }, // director only
  33 |   { name: 'dashboard', probe: '/api/dashboard/summary', allowed: [] }, // director only
  34 |   { name: 'sparepart', probe: '/api/sparepart', allowed: ['marketing', 'inventory_admin'] },
  35 | ];
  36 | 
  37 | // The four non-director seeded roles we can authenticate as.
  38 | const TEST_ROLES = ['marketing', 'finance', 'inventory_admin', 'service'];
  39 | 
  40 | test.describe('Authorization Matrix (role × route)', () => {
  41 |   let anon;
  42 |   const ctxByRole = {};
  43 | 
  44 |   test.beforeAll(async ({ playwright }) => {
  45 |     anon = await playwright.request.newContext({
  46 |       baseURL: 'http://localhost:8000',
  47 |       extraHTTPHeaders: { Accept: 'application/json' },
  48 |     });
  49 |     for (const role of TEST_ROLES) {
  50 |       const res = await anon.post('/api/login', { data: { email: ROLES[role], password: 'password' } });
  51 |       const token = (await res.json()).access_token;
  52 |       expect(token, `login failed for ${role}`).toBeDefined();
  53 |       ctxByRole[role] = await request.newContext({
  54 |         baseURL: 'http://localhost:8000',
  55 |         extraHTTPHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  56 |       });
  57 |     }
  58 |   });
  59 | 
  60 |   test.afterAll(async () => {
  61 |     for (const role of TEST_ROLES) await ctxByRole[role]?.dispose();
  62 |     await anon.dispose();
  63 |   });
  64 | 
  65 |   // Forbidden pairs → 403
  66 |   for (const group of GROUPS) {
  67 |     for (const role of TEST_ROLES) {
  68 |       if (group.allowed.includes(role)) continue;
  69 |       test(`AZ-403 ${role} cannot GET ${group.name} → 403`, async () => {
  70 |         const res = await ctxByRole[role].get(group.probe);
  71 |         expect(res.status()).toBe(403);
  72 |       });
  73 |     }
  74 |   }
  75 | 
  76 |   // Allowed pairs → NOT 403 (rules out a blanket-deny false positive)
  77 |   for (const group of GROUPS) {
  78 |     for (const role of group.allowed) {
  79 |       test(`AZ-OK ${role} CAN GET ${group.name} (not 403)`, async () => {
  80 |         const res = await ctxByRole[role].get(group.probe);
> 81 |         expect(res.status()).not.toBe(403);
     |                                  ^ Error: expect(received).not.toBe(expected) // Object.is equality
  82 |       });
  83 |     }
  84 |   }
  85 | });
  86 | 
```