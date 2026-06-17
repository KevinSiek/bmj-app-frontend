# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wo-do.spec.js >> Work Order & Delivery Order E2E Tests >> WO-SETUP: Create Service Quotation, Move to PO, Move to PI, Pay DP, Set Ready
- Location: e2e\wo-do.spec.js:20:3

# Error details

```
TimeoutError: page.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Create PI")')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic "Toggle devtools panel" [ref=e3] [cursor=pointer]:
    - img [ref=e4]
  - generic "Toggle Component Inspector" [ref=e9] [cursor=pointer]:
    - img [ref=e10]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { closeModal } from './helpers.js';
  3   | 
  4   | test.describe('Work Order & Delivery Order E2E Tests', () => {
  5   |   test.describe.configure({ mode: 'serial' });
  6   | 
  7   |   // Variables to hold generated data
  8   |   let page;
  9   |   let servicePoId = '';
  10  |   let sparepartPoId = '';
  11  | 
  12  |   test.beforeAll(async ({ browser }) => {
  13  |     page = await browser.newPage();
  14  |   });
  15  | 
  16  |   test.afterAll(async () => {
  17  |     await page.close();
  18  |   });
  19  | 
  20  |   test('WO-SETUP: Create Service Quotation, Move to PO, Move to PI, Pay DP, Set Ready', async () => {
  21  |     test.setTimeout(120000);
  22  |     test.setTimeout(300000); // 180 seconds timeout for this long setup
  23  |     // 1. Create Service Quotation as Marketing
  24  |     await page.goto('/login');
  25  |     await page.fill('input[type="email"]', 'citra.k@bmj.com');
  26  |     await page.fill('input[type="password"]', 'password');
  27  |     await page.click('button[type="submit"]');
  28  |     await page.waitForURL('**/menu', { timeout: 20000 });
  29  | 
  30  |     await page.goto('/quotation/add');
  31  |     await page.selectOption('select[aria-label="Project Type"]', 'Service');
  32  |     await page.fill('input[placeholder="Company Name"]', 'PT WO Test');
  33  |     await page.fill('input[placeholder="Address"]', 'Jl. WO');
  34  |     await page.fill('input[placeholder="City"]', 'Jakarta');
  35  |     await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
  36  |     await page.fill('input[placeholder="Office"]', '021-123456');
  37  |     await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
  38  |     await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
  39  |     await page.fill('input[placeholder="Postal Code"]', '12345');
  40  |     await page.fill('textarea[placeholder="Notes"]', 'Setup WO PO');
  41  |     
  42  |     // Add Service Details
  43  |     await page.click('button:has-text("Add Service")');
  44  |     const firstRow = page.locator('.add-service .list.row').first();
  45  |     await firstRow.locator('input[placeholder="Service Name"]').fill('E2E Engine Repair');
  46  |     await firstRow.locator('input[placeholder="Quantity"]').fill('1');
  47  |     await firstRow.locator('input[placeholder="Unit Price"]').fill('5000000');
  48  |     
  49  |     await page.click('button.btn-process:has-text("Add Quotation")');
  50  |     await page.click('button:has-text("Yes")');
  51  |     await closeModal(page);
  52  |     
  53  |     // Move to PO — intercept API response to capture new PO ID
  54  |     await page.locator('.list .item').first().click();
  55  |     await page.click('button:has-text("Create PO")');
  56  |     await page.fill('.modal-body textarea', 'Move to Service PO');
  57  |     await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
  58  |     await page.click('.button-modal button:has-text("Create PO")');
  59  |     
  60  |     const [poResponse] = await Promise.all([
  61  |       page.waitForResponse(res => res.url().includes('/api/quotation/moveToPo/') && res.status() === 200),
  62  |       page.click('button:has-text("Yes")')
  63  |     ]);
  64  |     
  65  |     let capturedPoId = null;
  66  |     if (poResponse) {
  67  |       const body = await poResponse.json();
  68  |       if (body?.data?.id) capturedPoId = body.data.id;
  69  |     }
  70  | 
  71  |     // Wait for navigation and for API response to be captured
  72  |     await page.waitForURL(/.*purchase-order/, { timeout: 15000 });
  73  |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  74  |     await closeModal(page);
  75  |     servicePoId = capturedPoId;
  76  | 
  77  |     // Logout Marketing and Login as Finance
  78  |     await page.evaluate(() => localStorage.clear());
  79  |     await page.goto('/login');
  80  |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  81  |     await page.fill('input[type="password"]', 'password');
  82  |     await page.click('button[type="submit"]');
  83  |     await page.waitForURL('**/menu', { timeout: 20000 });
  84  | 
  85  |     // Move to PI — navigate directly to the known PO ID (or fallback to list)
  86  |     if (servicePoId) {
  87  |       await page.goto(`/purchase-order/${servicePoId}`);
  88  |     } else {
  89  |       await page.goto('/purchase-order');
  90  |       await page.waitForSelector('.list .item', { timeout: 10000 });
  91  |       await page.locator('.list .item').first().click();
  92  |     }
  93  |     await page.waitForLoadState('networkidle', { timeout: 10000 });
> 94  |     await page.click('button:has-text("Create PI")');
      |                ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  95  |     await page.fill('.modal-body textarea', 'DP 50% for Service');
  96  |     await page.click('.button-modal button:has-text("Create PI")');
  97  |     
  98  |     // Capture PI ID when confirming
  99  |     const [piResponseWo] = await Promise.all([
  100 |       page.waitForResponse(res => res.url().includes('/api/purchase-order/moveToPi/') && res.status() === 200),
  101 |       page.click('button:has-text("Yes")')
  102 |     ]);
  103 |     
  104 |     let capturedWoPiId = null;
  105 |     if (piResponseWo) {
  106 |       const piBodyWo = await piResponseWo.json();
  107 |       if (piBodyWo?.data?.id) capturedWoPiId = piBodyWo.data.id;
  108 |     }
  109 |     await closeModal(page);
  110 | 
  111 |     // Pay DP
  112 |     if (capturedWoPiId) {
  113 |       await page.goto(`/proforma-invoice/${capturedWoPiId}`);
  114 |     } else {
  115 |       await page.goto('/proforma-invoice');
  116 |       await page.waitForSelector('.list .item', { timeout: 10000 });
  117 |       await page.locator('.list .item').first().click();
  118 |     }
  119 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  120 |     
  121 |     // Edit PI to set Down Payment
  122 |     await page.click('button.btn-edit');
  123 |     await page.fill('input[placeholder="Advance Payment"]', '150000');
  124 |     await page.click('button:has-text("Save")');
  125 |     await page.click('button:has-text("Yes")');
  126 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  127 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  128 |     await closeModal(page);
  129 | 
  130 |     await page.click('button:has-text("DP Paid")');
  131 |     await page.click('button:has-text("Yes")');
  132 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  133 |     await closeModal(page);
  134 |     await page.waitForTimeout(2000);
  135 | 
  136 |     // Logout Finance and Login as Director to set Service PO to Ready
  137 |     await page.evaluate(() => localStorage.clear());
  138 |     await page.goto('/login');
  139 |     await page.fill('input[type="email"]', 'director.jkt@bmj.com');
  140 |     await page.fill('input[type="password"]', 'password');
  141 |     await page.click('button[type="submit"]');
  142 |     await page.waitForURL('**/menu', { timeout: 20000 });
  143 | 
  144 |     if (servicePoId) {
  145 |       await page.goto(`/purchase-order/${servicePoId}`);
  146 |     } else {
  147 |       await page.goto('/purchase-order');
  148 |       await page.waitForSelector('.list .item', { timeout: 10000 });
  149 |       await page.locator('.list .item').first().click();
  150 |     }
  151 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  152 |     // Ready button is gated on the PO detail re-fetching its DP-paid status; wait for it
  153 |     // to render rather than clicking immediately (mirrors purchase-order.spec.js PO-API-012).
  154 |     const readyBtn = page.locator('button:has-text("Ready")');
  155 |     await expect(readyBtn).toBeVisible({ timeout: 15000 });
  156 |     await readyBtn.click();
  157 |     await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
  158 |     await page.click('#modalConfirmation button:has-text("Yes")');
  159 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  160 |     await closeModal(page);
  161 |     await page.waitForTimeout(2000);
  162 | 
  163 |     // Logout Director and Login as Service to Release
  164 |     await page.evaluate(() => localStorage.clear());
  165 |     await page.goto('/login');
  166 |     await page.fill('input[type="email"]', 'hadi.s@bmj.com');
  167 |     await page.fill('input[type="password"]', 'password');
  168 |     await page.click('button[type="submit"]');
  169 |     await page.waitForURL('**/menu', { timeout: 20000 });
  170 |     
  171 |     // Navigate directly to the Service PO by ID (or fallback to list)
  172 |     if (servicePoId) {
  173 |       await page.goto(`/purchase-order/${servicePoId}`);
  174 |     } else {
  175 |       await page.goto('/purchase-order');
  176 |       await page.waitForSelector('.list .item', { timeout: 10000 });
  177 |       await page.locator('.list .item').first().click();
  178 |     }
  179 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  180 |     
  181 |     // Release Service PO -> Creates WO
  182 |     const releaseBtn = page.locator('button:has-text("Release")');
  183 |     await expect(releaseBtn).toBeVisible({ timeout: 15000 });
  184 |     await releaseBtn.click();
  185 |     await expect(page).toHaveURL(/.*work-order\/add/, { timeout: 20000 });
  186 |     
  187 |     const dateInputs = await page.locator('input[type="date"]').all();
  188 |     for (const input of dateInputs) {
  189 |       await input.fill('2026-06-01');
  190 |     }
  191 |     await page.fill('input[placeholder="Received by"]', 'John');
  192 |     await page.fill('input[placeholder="Compiled by"]', 'Jane');
  193 |     await page.fill('input[placeholder="Approved by"]', 'Director');
  194 |     await page.fill('input[placeholder="Dept Head Service"]', 'Bob');
```