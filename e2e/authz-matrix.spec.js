import { test, expect, request } from '@playwright/test';

/**
 * Full role × route authorization matrix. security-403.spec.js spot-checks a few pairs;
 * this systematically asserts that for every role-gated route group, each DISALLOWED role
 * gets 403, and an ALLOWED role does not. Derived from routes/api.php.
 *
 * Director is omitted from the disallowed set everywhere (RoleMiddleware bypass).
 */

// Seeded accounts (all password 'password').
const ROLES = {
  director: 'director.jkt@bmj.com',
  marketing: 'marketing.jkt@bmj.com',
  finance: 'finance.jkt@bmj.com',
  inventory_admin: 'inventory.admin.jkt@bmj.com',
  service: 'service.jkt@bmj.com',
};

// Route group → { probe (a cheap GET in the group), allowed roles } from routes/api.php.
// (purchase-order allows service too: Service releases Service-type POs into Work Orders.)
const GROUPS = [
  { name: 'quotation', probe: '/api/quotation', allowed: ['marketing', 'finance'] },
  { name: 'purchase-order', probe: '/api/purchase-order', allowed: ['marketing', 'finance', 'inventory_admin', 'service'] },
  { name: 'invoice', probe: '/api/invoice', allowed: ['finance'] },
  { name: 'proforma-invoice', probe: '/api/proforma-invoice', allowed: ['finance'] },
  { name: 'work-order', probe: '/api/work-order', allowed: ['service'] },
  { name: 'delivery-order', probe: '/api/delivery-order', allowed: ['inventory_admin'] },
  { name: 'back-order', probe: '/api/back-order', allowed: ['inventory_admin'] },
  { name: 'buy', probe: '/api/buy', allowed: [] }, // inventory_purchase/inventory only — none of our seeded non-director accounts qualify
  { name: 'employee', probe: '/api/employee', allowed: [] }, // director only
  { name: 'general', probe: '/api/general', allowed: ['marketing', 'finance', 'inventory_admin', 'service'] }, // global settings
  { name: 'dashboard', probe: '/api/dashboard/summary', allowed: [] }, // director only
  { name: 'sparepart', probe: '/api/sparepart', allowed: ['marketing', 'inventory_admin', 'service'] },
];

// The four non-director seeded roles we can authenticate as.
const TEST_ROLES = ['marketing', 'finance', 'inventory_admin', 'service'];

test.describe('Authorization Matrix (role × route)', () => {
  let anon;
  const ctxByRole = {};

  test.beforeAll(async ({ playwright }) => {
    anon = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    for (const role of TEST_ROLES) {
      const res = await anon.post('/api/login', { data: { email: ROLES[role], password: 'password' } });
      const token = (await res.json()).access_token;
      expect(token, `login failed for ${role}`).toBeDefined();
      ctxByRole[role] = await request.newContext({
        baseURL: 'http://localhost:8000',
        extraHTTPHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
    }
  });

  test.afterAll(async () => {
    for (const role of TEST_ROLES) await ctxByRole[role]?.dispose();
    await anon.dispose();
  });

  // Forbidden pairs → 403
  for (const group of GROUPS) {
    for (const role of TEST_ROLES) {
      if (group.allowed.includes(role)) continue;
      test(`AZ-403 ${role} cannot GET ${group.name} → 403`, async () => {
        const res = await ctxByRole[role].get(group.probe);
        expect(res.status()).toBe(403);
      });
    }
  }

  // Allowed pairs → NOT 403 (rules out a blanket-deny false positive)
  for (const group of GROUPS) {
    for (const role of group.allowed) {
      test(`AZ-OK ${role} CAN GET ${group.name} (not 403)`, async () => {
        const res = await ctxByRole[role].get(group.probe);
        expect(res.status()).not.toBe(403);
      });
    }
  }
});
