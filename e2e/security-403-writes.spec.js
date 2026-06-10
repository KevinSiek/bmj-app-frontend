import { test, expect, request } from '@playwright/test';

/**
 * Write-path authorization. The existing security-403.spec.js proves GET reads are
 * gated; this proves the gate also covers mutations (POST/PUT/DELETE). RoleMiddleware
 * wraps each route prefix as a group, so a disallowed role is blocked on every verb —
 * but that's exactly the property worth pinning, since a hidden UI button proves nothing
 * about the API a determined client can call directly.
 *
 * Each case asserts a forbidden role gets 403 on a mutation, paired (where cheap) with
 * an allowed role NOT getting 403, to rule out a blanket-deny false positive.
 */
test.describe('RoleMiddleware Write-Path 403 Security Tests', () => {
  let anon;

  test.beforeAll(async ({ playwright }) => {
    anon = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Accept: 'application/json' },
    });
  });

  test.afterAll(async () => {
    await anon.dispose();
  });

  async function ctxFor(email, password = 'password') {
    const res = await anon.post('/api/login', { data: { email, password } });
    const body = await res.json();
    expect(body.access_token).toBeDefined();
    return request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${body.access_token}`, Accept: 'application/json' },
    });
  }

  test('SECW-001: Unauthenticated mutation returns 401', async () => {
    const res = await anon.post('/api/employee', { data: { fullname: 'x' } });
    expect(res.status()).toBe(401);
  });

  test('SECW-002: Marketing cannot POST to employee (Director-only) → 403', async () => {
    const api = await ctxFor('citra.k@bmj.com'); // Marketing
    const res = await api.post('/api/employee', {
      data: { fullname: 'Hacker', email: 'h@bmj.com', username: 'hacker', role: 'Marketing', branch: 'Jakarta' },
    });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('SECW-003: Marketing cannot POST work-order process (Service-only) → 403', async () => {
    const api = await ctxFor('citra.k@bmj.com'); // Marketing
    const res = await api.post('/api/work-order/process/1', { data: {} });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('SECW-004: Finance cannot POST buy (Inventory/Director-only) → 403', async () => {
    const api = await ctxFor('fajar.n@bmj.com'); // Finance
    const res = await api.post('/api/buy', {
      data: { totalAmount: 1, branch: 'Jakarta', spareparts: [] },
    });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('SECW-005: Service cannot POST proforma-invoice dpPaid (Finance-only) → 403', async () => {
    const api = await ctxFor('hadi.s@bmj.com'); // Service
    const res = await api.post('/api/proforma-invoice/dpPaid/1', { data: {} });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('SECW-006: Inventory Admin cannot PUT proforma-invoice (Finance-only) → 403', async () => {
    const api = await ctxFor('eko.p@bmj.com'); // Inventory Admin
    const res = await api.put('/api/proforma-invoice/1', { data: { downPayment: 1 } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('SECW-007: Marketing cannot PUT general settings (Director-only) → 403', async () => {
    const api = await ctxFor('citra.k@bmj.com'); // Marketing
    const res = await api.put('/api/general', { data: { discount: 0.5 } });
    expect(res.status()).toBe(403);
    await api.dispose();
  });

  test('SECW-008: Allow-case — Director CAN POST employee (not 403)', async () => {
    const api = await ctxFor('director.jkt@bmj.com'); // Director
    const res = await api.post('/api/employee', {
      data: {
        fullname: 'Authz OK', email: `authz_${Date.now()}@bmj.com`,
        username: `authz_${Date.now()}`, role: 'Marketing', branch: 'Jakarta',
      },
    });
    // Whatever the validation outcome, it must NOT be a 403 — the role IS authorized.
    expect(res.status()).not.toBe(403);
    await api.dispose();
  });
});
