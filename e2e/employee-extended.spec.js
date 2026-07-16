import { test, expect } from '@playwright/test';

test.describe('Employee Extended API Tests (Update, Delete, Credentials)', () => {
  let apiContext;
  let token;
  let adminContext;

  test.beforeAll(async ({ playwright }) => {
    adminContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
    });

    // Login as Director to get admin token
    const loginResponse = await adminContext.post('/api/login', {
      data: {
        email: 'director.jkt@bmj.com',
        password: 'password'
      }
    });
    const loginBody = await loginResponse.json();
    token = loginBody.access_token;
    expect(token).toBeDefined();

    adminContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  });

  test.afterAll(async () => {
    await adminContext.dispose();
  });

  test.describe('Employee CRUD and Reset Password', () => {
    let employeeSlug;
    let tempPassword;
    let employeeEmail = `e2e_emp_${Date.now()}@bmj.com`;
    let employeeUsername = `e2e_emp_${Date.now()}`;

    test('EMP-EXT-001: Create Employee', async () => {
      const response = await adminContext.post('/api/employee', {
        data: {
          fullname: 'E2E Test Employee',
          email: employeeEmail,
          username: employeeUsername,
          role: 'Marketing',
          branch: 'Jakarta'
        }
      });
      const body = await response.json();
      expect(response.status()).toBe(201);
      
      employeeSlug = body.data.employee.slug;
      tempPassword = body.data.temp_password; // Usually returned in response
      expect(employeeSlug).toBeDefined();
    });

    test('EMP-EXT-002: Update Employee', async () => {
      expect(employeeSlug).toBeDefined();
      const response = await adminContext.put(`/api/employee/${employeeSlug}`, {
        data: {
          fullname: 'E2E Test Employee Updated',
          email: employeeEmail,
          username: employeeUsername,
          role: 'Finance',
          branch: 'Semarang'
        }
      });
      expect(response.status()).toBe(200);

      const getResponse = await adminContext.get(`/api/employee/${employeeSlug}`);
      const getBody = await getResponse.json();
      expect(getBody.data.fullname).toBe('E2E Test Employee Updated');
      expect(getBody.data.role).toBe('Finance');
    });

    test('EMP-EXT-003: Reset Password', async () => {
      expect(employeeSlug).toBeDefined();
      const response = await adminContext.post(`/api/employee/reset-password/${employeeSlug}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data.temp_password).toBeDefined();
      tempPassword = body.data.temp_password; // Overwrite with new temp pass
    });

    test('EMP-EXT-004: Temp Password Login & Change Password Flow', async ({ playwright }) => {
      expect(tempPassword).toBeDefined();
      
      const userContext = await playwright.request.newContext({
        baseURL: 'http://localhost:8000',
        extraHTTPHeaders: { 'Accept': 'application/json' }
      });

      // 1. Login with Temp Password
      let loginRes = await userContext.post('/api/login', {
        data: { email: employeeEmail, password: tempPassword }
      });
      expect(loginRes.status()).toBe(200);
      let loginBody = await loginRes.json();
      expect(loginBody.use_temp_password).toBe(true);
      let userToken = loginBody.access_token;

      // 2. Try logging in again with the same temp password -> Should Fail (Already Used)
      // Sometimes it fails immediately or prompts for change, but API usually rejects it if temp_pass_already_use = true
      // We will skip this exact test if the backend only enforces it via `use_temp_password` flag without blocking the token generation.

      // 3. Change Password
      const authUserContext = await playwright.request.newContext({
        baseURL: 'http://localhost:8000',
        extraHTTPHeaders: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });

      const changeRes = await authUserContext.post('/api/user/changePasswordOrPhone', {
        data: {
          password: 'NewPassword123!',
          confirm_password: 'NewPassword123!'
        }
      });
      expect(changeRes.status()).toBe(200);

      // 4. Login with New Password
      loginRes = await userContext.post('/api/login', {
        data: { email: employeeEmail, password: 'NewPassword123!' }
      });
      expect(loginRes.status()).toBe(200);
      loginBody = await loginRes.json();
      expect(loginBody.use_temp_password).toBe(false); // No longer using temp pass

      await userContext.dispose();
      await authUserContext.dispose();
    });

    test('EMP-EXT-005: Delete Employee', async () => {
      expect(employeeSlug).toBeDefined();
      const response = await adminContext.delete(`/api/employee/${employeeSlug}`);
      expect(response.status()).toBe(200);

      const getResponse = await adminContext.get(`/api/employee/${employeeSlug}`);
      expect(getResponse.status()).toBe(404);
    });
  });
});
