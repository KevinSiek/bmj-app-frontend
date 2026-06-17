# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: proforma-invoice.spec.js >> Proforma Invoice E2E Tests (Live DB) >> PI-API-008 & UI-PI-009: Move PO to PI & Check UI
- Location: e2e\proforma-invoice.spec.js:76:3

# Error details

```
TimeoutError: page.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Create PI")')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - navigation [ref=e5]:
      - generic [ref=e6]:
        - link "PT. BMJ" [ref=e8] [cursor=pointer]:
          - /url: /menu
        - generic [ref=e11]:
          - generic [ref=e12]:
            - generic [ref=e14]: 
            - generic [ref=e15]: Finance
          - link " Quotation" [ref=e16] [cursor=pointer]:
            - /url: /quotation
            - generic [ref=e17]:
              - generic [ref=e19]: 
              - generic [ref=e20]: Quotation
          - link " Purchase Order" [ref=e21] [cursor=pointer]:
            - /url: /purchase-order
            - generic [ref=e22]:
              - generic [ref=e24]: 
              - generic [ref=e25]: Purchase Order
          - link " Proforma Invoice" [ref=e26] [cursor=pointer]:
            - /url: /proforma-invoice
            - generic [ref=e27]:
              - generic [ref=e29]: 
              - generic [ref=e30]: Proforma Invoice
          - link " Invoice" [ref=e31] [cursor=pointer]:
            - /url: /invoice
            - generic [ref=e32]:
              - generic [ref=e34]: 
              - generic [ref=e35]: Invoice
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e41]: 
          - generic [ref=e42]: Detail PO
        - button "Track" [ref=e44] [cursor=pointer]
      - generic [ref=e46]:
        - generic [ref=e47]: Hello, Fajar
        - link [ref=e50] [cursor=pointer]:
          - /url: "#"
          - img [ref=e51]: 
  - generic [ref=e53]:
    - generic "Toggle devtools panel" [ref=e54] [cursor=pointer]:
      - img [ref=e55]
    - generic "Toggle Component Inspector" [ref=e60] [cursor=pointer]:
      - img [ref=e61]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { closeModal } from './helpers.js';
  3   | import path from 'path';
  4   | 
  5   | test.describe('Proforma Invoice E2E Tests (Live DB)', () => {
  6   |   test.describe.configure({ mode: 'serial' });
  7   | 
  8   |   let page;
  9   |   let poId = '';
  10  |   let piId = '';
  11  | 
  12  |   test.beforeAll(async ({ browser }) => {
  13  |     page = await browser.newPage();
  14  |   });
  15  | 
  16  |   test.afterAll(async () => {
  17  |     await page.close();
  18  |   });
  19  | 
  20  |   test('PI-SETUP: Create a PO to test PI workflows via UI', async () => {
  21  |     test.setTimeout(90000); // 90s timeout since it does a lot
  22  |     // Login as Marketing
  23  |     await page.goto('/login');
  24  |     await page.fill('input[type="email"]', 'citra.k@bmj.com');
  25  |     await page.fill('input[type="password"]', 'password');
  26  |     await page.click('button[type="submit"]');
  27  |     await page.waitForURL('**/menu', { timeout: 20000 });
  28  | 
  29  |     // Create Quotation
  30  |     await page.goto('/quotation/add');
  31  |     await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
  32  |     await page.fill('input[placeholder="Company Name"]', 'PT PI Testing');
  33  |     await page.fill('input[placeholder="Address"]', 'Jl. PI 123');
  34  |     await page.fill('input[placeholder="City"]', 'Jakarta');
  35  |     await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
  36  |     await page.fill('input[placeholder="Office"]', '021-123456');
  37  |     await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
  38  |     await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
  39  |     await page.fill('input[placeholder="Postal Code"]', '12345');
  40  |     await page.fill('textarea[placeholder="Notes"]', 'Setup PI PO');
  41  |     
  42  |     // Add Sparepart. Use the proven autocomplete pattern from quotation.spec.js:
  43  |     // arm the search-response waiter, type char-by-char (pressSequentially fires the
  44  |     // debounced input events that .fill() does not), await the API, then click the item.
  45  |     await page.click('button:has-text("Add Sparepart")');
  46  |     const firstRow = page.locator('.add-sparepart .list.row').first();
  47  |     const partNameInput = firstRow.locator('input[placeholder="Part Name"]');
  48  |     const searchPromise = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
  49  |     await partNameInput.pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });
  50  |     await searchPromise;
  51  |     const ddItem = firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first();
  52  |     await expect(ddItem).toBeVisible({ timeout: 10000 });
  53  |     await ddItem.click();
  54  |     await firstRow.locator('input[placeholder="Quantity"]').fill('2');
  55  |     await firstRow.locator('input[placeholder="Unit Price"]').blur();
  56  |     
  57  |     await page.click('button.btn-process:has-text("Add Quotation")');
  58  |     await page.click('button:has-text("Yes")');
  59  |     await closeModal(page);
  60  |     
  61  |     // Move to PO
  62  |     await page.locator('.list .item').first().click();
  63  |     await page.click('button:has-text("Create PO")');
  64  |     await page.fill('.modal-body textarea', 'Move to PO setup for PI');
  65  |     await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
  66  |     await page.click('.button-modal button:has-text("Create PO")');
  67  |     await page.click('button:has-text("Yes")');
  68  |     await closeModal(page);
  69  | 
  70  |     // Extract PO ID
  71  |     const poUrl = page.url();
  72  |     poId = poUrl.split('/').pop();
  73  |     await page.screenshot({ path: 'e2e/screenshots/pi-setup-success.png', fullPage: true });
  74  |   });
  75  | 
  76  |   test('PI-API-008 & UI-PI-009: Move PO to PI & Check UI', async () => {
  77  |     // Logout Marketing and Login as Finance
  78  |     await page.evaluate(() => localStorage.clear());
  79  |     await page.goto('/login');
  80  |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  81  |     await page.fill('input[type="password"]', 'password');
  82  |     await page.click('button[type="submit"]');
  83  |     await page.waitForURL('**/menu', { timeout: 20000 });
  84  | 
  85  |     await page.goto('/purchase-order');
  86  |     await page.locator('.list .item').first().click();
  87  |     
> 88  |     await page.click('button:has-text("Create PI")');
      |                ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  89  |     await page.fill('.modal-body textarea', 'DP 50% for PI');
  90  |     await page.click('.button-modal button:has-text("Create PI")');
  91  |     await page.click('button:has-text("Yes")');
  92  |     await expect(page).toHaveURL(/.*proforma-invoice/, { timeout: 20000 });
  93  |     await closeModal(page);
  94  |     
  95  |     const piUrl = page.url();
  96  |     piId = piUrl.split('/').pop();
  97  | 
  98  |     await page.screenshot({ path: 'e2e/screenshots/pi-api-008-move-to-pi.png', fullPage: true });
  99  |   });
  100 | 
  101 |   test('PI-API-003: Pay Down Payment (DP)', async () => {
  102 |     await page.goto('/proforma-invoice');
  103 |     await page.locator('.list .item').first().click();
  104 |     
  105 |     const dpPaidBtn = page.locator('button:has-text("DP Paid")');
  106 |     await expect(dpPaidBtn).toBeVisible({ timeout: 15000 });
  107 |     
  108 |     // Edit PI to set Down Payment
  109 |     await page.click('button.btn-edit');
  110 |     await page.fill('input[placeholder="Advance Payment"]', '200000');
  111 |     await page.click('button:has-text("Save")');
  112 |     await page.click('button:has-text("Yes")');
  113 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  114 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  115 |     await closeModal(page);
  116 | 
  117 |     await dpPaidBtn.click();
  118 |     
  119 |     await page.click('button:has-text("Yes")');
  120 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  121 |     await closeModal(page);
  122 | 
  123 |     await page.screenshot({ path: 'e2e/screenshots/pi-api-003-dp-paid.png', fullPage: true });
  124 |     await expect(dpPaidBtn).not.toBeVisible();
  125 |   });
  126 | 
  127 |   test('PI-API-005: Pay Full -> Creates Invoice', async () => {
  128 |     await page.goto('/proforma-invoice');
  129 |     await page.locator('.list .item').first().click();
  130 |     
  131 |     const fullPaidBtn = page.locator('button:has-text("Create Invoice")');
  132 |     await expect(fullPaidBtn).toBeVisible({ timeout: 15000 });
  133 |     await fullPaidBtn.click();
  134 |     
  135 |     await page.click('button:has-text("Yes")');
  136 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  137 |     await closeModal(page);
  138 | 
  139 |     await page.screenshot({ path: 'e2e/screenshots/pi-api-005-full-paid.png', fullPage: true });
  140 |     
  141 |     // Verify Invoice exists
  142 |     await page.goto('/invoice');
  143 |     await expect(page.locator('.list .item').first()).toBeVisible();
  144 |   });
  145 | 
  146 |   test('PI-API-008 (Negative): Finance & Director roles only', async () => {
  147 |     // Login as Inventory Admin
  148 |     await page.evaluate(() => localStorage.clear());
  149 |     await page.goto('/login');
  150 |     await page.fill('input[type="email"]', 'eko.p@bmj.com');
  151 |     await page.fill('input[type="password"]', 'password');
  152 |     await page.click('button[type="submit"]');
  153 |     await page.waitForURL('**/menu', { timeout: 20000 });
  154 | 
  155 |     const sidebar = page.locator('.sidebar');
  156 |     await expect(sidebar.locator('text="Proforma Invoice"')).not.toBeVisible();
  157 |     await page.screenshot({ path: 'e2e/screenshots/pi-api-008-role-block.png', fullPage: true });
  158 |   });
  159 | });
  160 | 
```