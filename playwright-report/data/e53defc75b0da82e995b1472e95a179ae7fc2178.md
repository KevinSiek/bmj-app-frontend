# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: master-data.spec.js >> Master Data E2E Tests >> EMP-API-009: Create Employee (Director)
- Location: e2e\master-data.spec.js:17:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text="pw_user_1781206868695"')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text="pw_user_1781206868695"')

```

```yaml
- navigation:
  - link "PT. BMJ":
    - /url: /menu
  - text:  Director
  - link " Dashboard":
    - /url: /dashboard
  - link " Quotation":
    - /url: /quotation
  - link " Purchase Order":
    - /url: /purchase-order
  - link " Proforma Invoice":
    - /url: /proforma-invoice
  - link " Invoice":
    - /url: /invoice
  - text:  Spareparts 
  - link " Back Order":
    - /url: /back-order
  - link " Purchase":
    - /url: /purchase
  - link " Employee":
    - /url: /employee
  - link " Work Order":
    - /url: /work-order
  - link " Delivery Order":
    - /url: /delivery-order
  - link " General":
    - /url: /general
  - link " Upload Data":
    - /url: /upload-data
- text: Employee Hello, Budi
- link:
  - /url: "#"
  - img: 
- textbox "Search"
- button ""
- button "Add Employee"
- text: 1 director_jkt Jakarta Director 2 director_smg Semarang Director 3 citra_k Jakarta Marketing 4 dewi_l Jakarta Marketing 5 agus_s Semarang Marketing 6 rina_w Semarang Marketing 7 eko_p Jakarta Inventory Admin 8 indah_s Semarang Inventory Purchase 9 headinv_jkt Jakarta Head Inventory 10 fajar_n Jakarta Finance 11 gita_p Semarang Finance 12 hadi_s Jakarta Service 13 joko_w Semarang Service 14 al1178120645277613318 Jakarta Marketing 15 al2178120645680117342 Jakarta Marketing 16 al3178120645875819299 Jakarta Marketing 17 al4178120646344223983 Jakarta Marketing 18 al5178120646613026671 Jakarta Marketing 19 al6178120647106731609 Jakarta Marketing 20 al7178120647730437845 Jakarta Marketing
- navigation "page navigation":
  - list:
    - listitem:
      - link "Previous":
        - /url: "#"
    - listitem:
      - link "1":
        - /url: "#"
    - listitem:
      - link "2":
        - /url: "#"
    - listitem:
      - link "Next":
        - /url: "#"
- img
- img
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { closeModal } from './helpers.js';
  3  | 
  4  | test.describe('Master Data E2E Tests', () => {
  5  |   test.describe.configure({ mode: 'serial' });
  6  | 
  7  |   let page;
  8  | 
  9  |   test.beforeAll(async ({ browser }) => {
  10 |     page = await browser.newPage();
  11 |   });
  12 | 
  13 |   test.afterAll(async () => {
  14 |     await page.close();
  15 |   });
  16 | 
  17 |   test('EMP-API-009: Create Employee (Director)', async () => {
  18 |     await page.goto('/login');
  19 |     await page.fill('input[type="email"]', 'director.jkt@bmj.com');
  20 |     await page.fill('input[type="password"]', 'password');
  21 |     await page.click('button[type="submit"]');
  22 |     await page.waitForURL('**/menu', { timeout: 20000 });
  23 | 
  24 |     await page.goto('/employee/add');
  25 |     const ts = Date.now();
  26 |     await page.fill('input[placeholder="Fullname"]', 'Playwright User');
  27 |     await page.fill('input[placeholder="Email"]', `pw_user_${ts}@bmj.com`);
  28 |     await page.fill('input[placeholder="Username"]', `pw_user_${ts}`);
  29 |     await page.selectOption('#role', 'Marketing');
  30 |     await page.selectOption('#branch', 'Jakarta');
  31 |     
  32 |     await page.screenshot({ path: 'e2e/screenshots/emp-api-009-form.png', fullPage: true });
  33 | 
  34 |     await page.click('button:has-text("Add Employee")');
  35 |     await page.click('button:has-text("Yes")');
  36 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  37 |     
  38 |     // Close success modal
  39 |     await closeModal(page);
  40 |     await page.goto('/employee');
  41 |     await page.waitForSelector('.list .item');
> 42 |     await expect(page.locator(`text="pw_user_${ts}"`)).toBeVisible();
     |                                                        ^ Error: expect(locator).toBeVisible() failed
  43 | 
  44 |     await page.screenshot({ path: 'e2e/screenshots/emp-api-009-list.png', fullPage: true });
  45 |   });
  46 | 
  47 |   test('SP-API-003: Create Sparepart', async () => {
  48 |     await page.goto('/spareparts/add');
  49 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  50 |     
  51 |     await page.fill('input[placeholder="Sparepart Name"]', 'PW Engine Belt');
  52 |     await page.fill('input[placeholder="Sparepart Number"]', 'PW-1000');
  53 |     await page.fill('input[placeholder="Buy Price"]', '300000');
  54 |     await page.fill('input[placeholder="Selling Price"]', '550000');
  55 | 
  56 |     // Fill all branch stock inputs
  57 |     const stockInputs = await page.locator('input[placeholder="Stock"]').all();
  58 |     for (const input of stockInputs) {
  59 |       await input.fill('10');
  60 |     }
  61 | 
  62 |     // Add Seller
  63 |     await page.click('button:has-text("Add Seller")');
  64 |     // Select first available seller
  65 |     await page.selectOption('.lists select', { index: 1 });
  66 |     await page.fill('input[placeholder="Purchase Price"]', '280000');
  67 |     await page.fill('input[placeholder="Quantity"]', '100');
  68 |     
  69 |     await page.screenshot({ path: 'e2e/screenshots/sp-api-003-form.png', fullPage: true });
  70 | 
  71 |     await page.click('button.btn-process');
  72 |     await page.click('button:has-text("Yes")');
  73 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  74 |     await closeModal(page);
  75 | 
  76 |     await page.goto('/spareparts?search=PW-1000');
  77 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  78 |     await expect(page.locator('text="PW-1000"')).toBeVisible({ timeout: 10000 });
  79 |     
  80 |     await page.screenshot({ path: 'e2e/screenshots/sp-api-003-list.png', fullPage: true });
  81 |   });
  82 | 
  83 |   test('GEN-API-007: Update General Settings', async () => {
  84 |     await page.goto('/general');
  85 |     
  86 |     await page.fill('input[placeholder="Discount"]', '0.15');
  87 |     await page.fill('input[placeholder="VAT"]', '0.12');
  88 |     
  89 |     await page.screenshot({ path: 'e2e/screenshots/gen-api-007-form.png', fullPage: true });
  90 | 
  91 |     await page.click('button:has-text("Update Data")');
  92 |     await page.click('button:has-text("Yes")');
  93 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  94 |     await closeModal(page);
  95 | 
  96 |     await page.screenshot({ path: 'e2e/screenshots/gen-api-007-saved.png', fullPage: true });
  97 |   });
  98 | });
  99 | 
```