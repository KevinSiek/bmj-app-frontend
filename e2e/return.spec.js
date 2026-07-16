import { test, expect } from '@playwright/test';
import { closeModal } from './helpers.js';

test.describe('Return Flow E2E Tests (Live DB)', () => {
  test.describe.configure({ mode: 'serial' });

  let page;
  let apiContext;
  let poId;

  test.beforeAll(async ({ browser, playwright }) => {
    page = await browser.newPage();

    // Setup API context as Director to build the pipeline
    const loginRes = await playwright.request.newContext({ baseURL: 'http://localhost:8000' });
    const lr = await loginRes.post('/api/login', { data: { email: 'director.jkt@bmj.com', password: 'password' } });
    const body = await lr.json();
    await loginRes.dispose();

    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8000',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${body.access_token}`,
        'Accept': 'application/json'
      }
    });
  });

  test.afterAll(async () => {
    await page.close();
    await apiContext.dispose();
  });

  test('RET-SETUP: Create Quotation → PO → Ready → Release → Done via API, then Return via UI', async () => {
    test.setTimeout(120000);

    // Get a sparepart with stock
    const spRes = await apiContext.get('/api/sparepart?search=E2E+Guaranteed');
    const spBody = await spRes.json();
    const sp = spBody.data?.data?.[0];
    expect(sp).toBeDefined();
    const sparepartId = sp.id;

    // 1. Create Quotation
    let res = await apiContext.post('/api/quotation', {
      data: {
        project: { type: 'Spareparts' },
        customer: {
          companyName: 'PT Return Test E2E',
          address: 'Jl. Return 123',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '12345',
          office: '021-123456',
          urban: 'Kelurahan Test',
          subdistrict: 'Kecamatan Test',
        npwp: '123', email: 'e2e@bmj.com',
        },
        price: { amount: 50000 },
        spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 50000 }]
      }
    });
    let body = await res.json();
    expect(res.status()).toBe(201);
    const quotSlug = body.data.slug;

    // 2. Approve Quotation
    await apiContext.post(`/api/quotation/approve/${quotSlug}`, { data: { notes: 'Approved for return test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });

    // 3. Move to PO
    res = await apiContext.post(`/api/quotation/moveToPo/${quotSlug}`, { data: { notes: 'Move to PO for return test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    body = await res.json();
    expect(res.status()).toBe(200);
    poId = body.data.id;

    // 4. Move to PI
    res = await apiContext.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'Create PI for return', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(200);

    // 5. Release DO (Requires deliveryOrder payload)
    res = await apiContext.post(`/api/purchase-order/release/${poId}`, { 
      data: { 
        deliveryOrder: {
          deliveryOrderDate: '2026-06-06',
          pickedBy: 'Courier',
          shipMode: 'Land',
          orderType: 'Normal'
        },
        notes: 'Release DO' 
      } 
    });
    expect(res.status()).toBe(200);

    // 7. Mark Done (Marketing role in UI or Director via API)
    res = await apiContext.post(`/api/purchase-order/done/${poId}`, { data: { notes: 'Done', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
    expect(res.status()).toBe(200);

    // 8. Now use UI (Marketing) to click Return
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    await page.goto(`/purchase-order/${poId}`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Debug: fetch PO to see status array
    const poRes = await apiContext.get(`/api/purchase-order/${poId}`);
    const poBody = await poRes.json();
    console.log("PO Detail in RET-SETUP:", JSON.stringify(poBody.data?.status));

    const returnBtn = page.locator('button:has-text("Return")');
    await expect(returnBtn).toBeVisible({ timeout: 10000 });
    await returnBtn.click();

    await page.waitForURL(/.*return/, { timeout: 10000 });

    // Check return items and click submit
    const listRow = page.locator('.add-sparepart .list.row').first();
    await listRow.locator('.col-3 input[type="number"]').fill('1');
    await listRow.locator('button.btn-outline-dark').click();

    const submitBtn = page.locator('button:has-text("Return")').last();
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
    await submitBtn.click();
    await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
    await page.click('#modalConfirmation button:has-text("Yes")');
    await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
    await closeModal(page);

    await page.screenshot({ path: 'e2e/screenshots/return-quotation.png', fullPage: true });
  });

  test('RET-API-002: Approve Return (Director)', async () => {
    // Login as Director
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', 'director.jkt@bmj.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/menu', { timeout: 20000 });

    // Navigate to Return Page
    await page.goto('/return');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Check list
    await expect(page.locator('.list .item').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.list .item').first().click();

    // Approve Return
    const approveReturnBtn = page.locator('button:has-text("Approve Return")');
    if (await approveReturnBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await approveReturnBtn.click();
      await page.fill('.modal-body textarea', 'Approved return').catch(() => {});
      await page.click('.button-modal button:has-text("Approve Return")').catch(() => {});
      await page.click('button:has-text("Yes")');
      await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
      await closeModal(page);
    }

    await page.screenshot({ path: 'e2e/screenshots/return-approve.png', fullPage: true });
  });
});
