import { test, expect, request } from '@playwright/test';

/**
 * Auth lifecycle: logout token revocation, changePassword (valid + weak), and the
 * temp-password issuance/login flow. Uses freshly-created employees so seeded accounts
 * are not mutated mid-run.
 */
test.describe('Auth Lifecycle', () => {
  let anon;
  let director;

  async function login(email, password) {
    return anon.post('/api/login', { data: { email, password } });
  }

  async function ctxFromToken(token) {
    return request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
  }

  // Create an employee via the Director and return { email, slug, tempPassword }.
  async function newEmployee(tag) {
    const stamp = `${tag}${Date.now()}${Math.floor(performance.now())}`;
    const email = `${stamp}@bmj.com`;
    const res = await director.post('/api/employee', {
      data: { fullname: 'Lifecycle', email, username: stamp, role: 'Marketing', branch: 'Jakarta', password: 'password' },
    });
    expect(res.status()).toBe(201);
    const emp = (await res.json()).data.employee;
    return { email, slug: emp.slug, tempPassword: emp.temp_password };
  }

  test.beforeAll(async ({ playwright }) => {
    anon = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    const token = (await (await login('director.jkt@bmj.com', 'password')).json()).access_token;
    expect(token).toBeDefined();
    director = await ctxFromToken(token);
  });

  test.afterAll(async () => {
    await director.dispose();
    await anon.dispose();
  });

  test('AL-001: logout revokes the current token', async () => {
    const emp = await newEmployee('al1');
    const token = (await (await login(emp.email, emp.tempPassword)).json()).access_token;
    expect(token).toBeDefined();
    const api = await ctxFromToken(token);

    expect((await api.get('/api/user')).status()).toBe(200);
    expect((await api.post('/api/logout')).status()).toBe(200);
    // The revoked token is now rejected.
    expect((await api.get('/api/user')).status()).toBe(401);
    await api.dispose();
  });

  test('AL-002: a new employee can log in with its temp password (use_temp_password=true)', async () => {
    const emp = await newEmployee('al2');
    const res = await login(emp.email, emp.tempPassword);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.use_temp_password).toBe(true);
    expect(body.access_token).toBeDefined();
  });

  test('AL-003: changePassword rejects a weak password (422) and accepts a strong one (200)', async () => {
    const emp = await newEmployee('al3');
    const token = (await (await login(emp.email, emp.tempPassword)).json()).access_token;
    const api = await ctxFromToken(token);

    // Weak (no uppercase / too short) → 422 validation.
    const weak = await api.post('/api/user/changePassword', { data: { password: 'weak', confirm_password: 'weak' } });
    expect(weak.status()).toBe(422);

    // Strong + matching confirmation → 200, and the new password then logs in.
    const strong = await api.post('/api/user/changePassword', { data: { password: 'StrongPass1', confirm_password: 'StrongPass1' } });
    expect(strong.status()).toBe(200);
    await api.dispose();

    expect((await login(emp.email, 'StrongPass1')).status()).toBe(200);
  });

  test('AL-004: changePassword requires matching confirm_password (422)', async () => {
    const emp = await newEmployee('al4');
    const token = (await (await login(emp.email, emp.tempPassword)).json()).access_token;
    const api = await ctxFromToken(token);
    const res = await api.post('/api/user/changePassword', { data: { password: 'StrongPass1', confirm_password: 'Mismatch9' } });
    expect(res.status()).toBe(422);
    await api.dispose();
  });

  test('AL-005: reset-password issues a usable temp password (Director)', async () => {
    const emp = await newEmployee('al5');
    // Consume the initial temp password by changing to a real one.
    const t = (await (await login(emp.email, emp.tempPassword)).json()).access_token;
    const api = await ctxFromToken(t);
    await api.post('/api/user/changePassword', { data: { password: 'StrongPass1', confirm_password: 'StrongPass1' } });
    await api.dispose();

    // Director resets → a fresh temp password is issued and works.
    const reset = await director.post(`/api/employee/reset-password/${emp.slug}`, { data: { poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(reset.status()).toBe(200);
    const body = await reset.json();
    const newTemp = body.data?.temp_password ?? body.temp_password;
    expect(newTemp).toBeTruthy();
    expect((await login(emp.email, newTemp)).status()).toBe(200);
  });

  // Regression guard for the temp-password single-use fix: a temp password authenticates
  // only far enough to change it (gated by must_change_password). Once the user sets a real
  // password, the temp password no longer works — so it is single-use in effect.
  test('AL-006: temp password is single-use — reuse fails after changePassword', async () => {
    const emp = await newEmployee('al6');

    // First login with the temp password succeeds and flags use_temp_password.
    const first = await login(emp.email, emp.tempPassword);
    expect(first.status()).toBe(200);
    const firstBody = await first.json();
    expect(firstBody.use_temp_password).toBe(true);
    const api = await ctxFromToken(firstBody.access_token);

    // While the force-change gate is up, normal endpoints are blocked with 403.
    const gated = await api.get('/api/quotation');
    expect(gated.status()).toBe(403);
    expect((await gated.json()).must_change_password).toBe(true);

    // Changing the password lifts the gate.
    expect((await api.post('/api/user/changePassword', { data: { password: 'StrongPass1', confirm_password: 'StrongPass1' } })).status()).toBe(200);
    await api.dispose();

    // The temp password no longer works (real password replaced it).
    expect((await login(emp.email, emp.tempPassword)).status()).toBe(401);
    // The new password works and the account is no longer gated.
    const ok = await login(emp.email, 'StrongPass1');
    expect(ok.status()).toBe(200);
    const okApi = await ctxFromToken((await ok.json()).access_token);
    expect((await okApi.get('/api/quotation')).status()).toBe(200);
    await okApi.dispose();
  });

  test('AL-007: a gated account cannot reach a protected mutation until password changed', async () => {
    const emp = await newEmployee('al7');
    const token = (await (await login(emp.email, emp.tempPassword)).json()).access_token;
    const api = await ctxFromToken(token);
    // POST to a normal endpoint is blocked while gated.
    const blocked = await api.post('/api/customer', {
      data: { company_name: 'X', office: '1', address: 'A', urban: 'U', subdistrict: 'S', city: 'C', province: 'P', postal_code: 12345 },
    });
    expect(blocked.status()).toBe(403);
    await api.dispose();
  });
});
