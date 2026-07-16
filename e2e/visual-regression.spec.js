import { test, expect } from '@playwright/test';
import { apiContextFor, provisionQuotationAndPo } from './helpers.js';

test.describe('Visual Regression Tests', () => {
  let adminContext;
  let adminPage;
  let poIdService;
  let poIdSpareparts;
  let woId;
  let borrowId;

  test.beforeAll(async ({ playwright, browser }) => {
    // We use a real browser context so we can set cookies/localStorage and navigate
    adminContext = await browser.newContext({
      baseURL: 'http://localhost:5173',
      viewport: { width: 1280, height: 720 }
    });
    
    // Login API to get token
    const apiCtx = await apiContextFor(playwright, 'director.jkt@bmj.com');
    const tokenHeader = (await apiCtx.storageState()).origins[0]?.localStorage || [];
    
    // Since apiContextFor doesn't return localStorage directly, we'll just login via UI for simplicity and reliability
    adminPage = await adminContext.newPage();
    await adminPage.goto('/login');
    await adminPage.fill('input[type="email"]', 'director.jkt@bmj.com');
    await adminPage.fill('input[type="password"]', 'password');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/menu', { timeout: 20000 });

    // Provision data using API Context
    const { poId: servicePoId } = await provisionQuotationAndPo(apiCtx, 'Service');
    const { poId: sparepartPoId } = await provisionQuotationAndPo(apiCtx, 'Spareparts');
    poIdService = servicePoId;
    poIdSpareparts = sparepartPoId;

    // Create PI before setting to Ready and Release
    const piServiceRes = await apiCtx.post(`/api/purchase-order/moveToPi/${poIdService}`, { data: { notes: 'PI', poNumber: `PO-SVC-${Date.now()}` } });
    if (!piServiceRes.ok()) throw new Error(`piService: ${await piServiceRes.text()}`);
    const piServiceId = (await piServiceRes.json()).data.id;
    
    const piSpareRes = await apiCtx.post(`/api/purchase-order/moveToPi/${poIdSpareparts}`, { data: { notes: 'PI', poNumber: `PO-SPR-${Date.now()}` } });
    if (!piSpareRes.ok()) throw new Error(`piSpare: ${await piSpareRes.text()}`);
    const piSpareId = (await piSpareRes.json()).data.id;

    // Pay DP
    const dpSvcRes = await apiCtx.post(`/api/proforma-invoice/dpPaid/${piServiceId}`, { data: { notes: 'DP Paid' } });
    if (!dpSvcRes.ok()) throw new Error(`dpSvc: ${await dpSvcRes.text()}`);
    const dpSprRes = await apiCtx.post(`/api/proforma-invoice/dpPaid/${piSpareId}`, { data: { notes: 'DP Paid' } });
    if (!dpSprRes.ok()) throw new Error(`dpSpr: ${await dpSprRes.text()}`);

    // Set Ready
    const readySvcRes = await apiCtx.post(`/api/purchase-order/ready/${poIdService}`);
    if (!readySvcRes.ok()) throw new Error(`readySvc: ${await readySvcRes.text()}`);
    const readySprRes = await apiCtx.post(`/api/purchase-order/ready/${poIdSpareparts}`);
    if (!readySprRes.ok()) throw new Error(`readySpr: ${await readySprRes.text()}`);

    // Release POs
    const relSvcRes = await apiCtx.post(`/api/purchase-order/release/${poIdService}`, {
      data: {
        notes: 'Release WO',
        serviceOrder: { receivedBy: 'E2E Recv', startDate: '2026-06-03', endDate: '2026-06-05' },
        poc: { compiled: 'E2E Comp', approver: 'E2E Appr', headOfService: 'E2E Head' },
        units: [{ quantity: 1, unitType: 'Test', jobDescriptions: 'Job' }]
      }
    });
    if (!relSvcRes.ok()) throw new Error(`relSvc: ${await relSvcRes.text()}`);
    
    const relSprRes = await apiCtx.post(`/api/purchase-order/release/${poIdSpareparts}`, {
      data: {
        notes: 'Release DO',
        deliveryOrder: {
          deliveryOrderDate: '2026-06-03',
          preparedBy: 'E2E Prep',
          receivedBy: 'E2E Recv',
          pickedBy: 'E2E Pick',
          shipMode: 'Land',
          orderType: 'Regular'
        }
      }
    });
    if (!relSprRes.ok()) throw new Error(`relSpr: ${await relSprRes.text()}`);
    
    const relSvcData = await relSvcRes.json();
    woId = relSvcData.data.work_order.id;

    // Create a Borrow
    const spRes = await apiCtx.get('/api/sparepart?search=E2E+Guaranteed');
    const sp = (await spRes.json()).data.data[0];

    const borrowRes = await apiCtx.post('/api/borrow', {
      data: {
        purchaseOrderId: poIdService,
        notes: "VRT Borrow",
        spareparts: [{ sparepartId: sp.id, quantity: 1 }]
      }
    });
    borrowId = (await borrowRes.json()).data.id;
    
    await apiCtx.dispose();
  });

  test.afterAll(async () => {
    await adminContext.close();
  });

  test('VRT-001: Dashboard rendering', async () => {
    await adminPage.goto('/dashboard');
    await adminPage.waitForLoadState('networkidle');
    // Wait for any charts or animations
    await adminPage.waitForTimeout(2000);
    await expect(adminPage).toHaveScreenshot('dashboard.png', { fullPage: true });
  });

  test('VRT-002: Quotation Add Form rendering', async () => {
    await adminPage.goto('/quotation/add');
    await adminPage.waitForLoadState('networkidle');
    // Ensure the project type dropdown is visible
    await expect(adminPage.locator('select[aria-label="Project Type"]')).toBeVisible();
    await expect(adminPage).toHaveScreenshot('quotation-add.png', { fullPage: true });
  });

  test('VRT-003: Work Order Edit Page rendering', async () => {
    await adminPage.goto(`/work-order/${woId}/edit`);
    await adminPage.waitForLoadState('networkidle');
    // Wait for WO data to populate
    await expect(adminPage.locator('input[placeholder="No"]')).toHaveValue(/WO\//);
    
    // Add a job so it renders the pill
    const jobInput = adminPage.locator('input[placeholder="Job"]').first();
    if (await jobInput.isVisible()) {
      await jobInput.fill('Visual Test Job');
      await jobInput.press('Enter');
    }
    await expect(adminPage).toHaveScreenshot('work-order-edit.png', { fullPage: true });
  });

  test('VRT-004: Borrow Detail Page rendering', async () => {
    await adminPage.goto(`/borrow/${borrowId}`);
    await adminPage.waitForLoadState('networkidle');
    // Wait for the tracking timeline or status pill
    await expect(adminPage.locator('.contain').first()).toBeVisible();
    await expect(adminPage).toHaveScreenshot('borrow-detail.png', { fullPage: true });
  });
});
