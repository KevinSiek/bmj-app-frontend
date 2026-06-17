# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: invoice.spec.js >> Invoice E2E Tests (Live DB) >> INV-SETUP: Create Full Pipeline to generate Invoice
- Location: e2e\invoice.spec.js:17:3

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
  4   | test.describe('Invoice E2E Tests (Live DB)', () => {
  5   |   test.describe.configure({ mode: 'serial' });
  6   | 
  7   |   let page;
  8   | 
  9   |   test.beforeAll(async ({ browser }) => {
  10  |     page = await browser.newPage();
  11  |   });
  12  | 
  13  |   test.afterAll(async () => {
  14  |     await page.close();
  15  |   });
  16  | 
  17  |   test('INV-SETUP: Create Full Pipeline to generate Invoice', async () => {
  18  |     test.setTimeout(300000); // Extended timeout for full pipeline
  19  |     
  20  |     // Login as Marketing
  21  |     await page.goto('/login');
  22  |     await page.fill('input[type="email"]', 'citra.k@bmj.com');
  23  |     await page.fill('input[type="password"]', 'password');
  24  |     await page.click('button[type="submit"]');
  25  |     await page.waitForURL('**/menu', { timeout: 20000 });
  26  | 
  27  |     // Create Quotation
  28  |     await page.goto('/quotation/add');
  29  |     await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
  30  |     await page.fill('input[placeholder="Company Name"]', 'PT Invoice Test');
  31  |     await page.fill('input[placeholder="Address"]', 'Jl. Invoice 123');
  32  |     await page.fill('input[placeholder="City"]', 'Jakarta');
  33  |     await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
  34  |     await page.fill('input[placeholder="Office"]', '021-123456');
  35  |     await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
  36  |     await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
  37  |     await page.fill('input[placeholder="Postal Code"]', '12345');
  38  |     await page.fill('textarea[placeholder="Notes"]', 'Setup Invoice');
  39  |     
  40  |     await page.click('button:has-text("Add Sparepart")');
  41  |     const firstRow = page.locator('.add-sparepart .list.row').first();
  42  |     // Robust autocomplete: arm the search waiter, type char-by-char, await the API.
  43  |     const invSearch = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
  44  |     await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });
  45  |     await invSearch;
  46  |     await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
  47  |     await firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();
  48  |     await firstRow.locator('input[placeholder="Quantity"]').fill('1');
  49  |     await firstRow.locator('input[placeholder="Unit Price"]').blur();
  50  |     
  51  |     await page.click('button.btn-process:has-text("Add Quotation")');
  52  |     await page.click('button:has-text("Yes")');
  53  |     await closeModal(page);
  54  | 
  55  |     // Create PO
  56  |     await page.locator('.list .item').first().click();
  57  |     await page.click('button:has-text("Create PO")');
  58  |     await page.fill('.modal-body textarea', 'Move to PO setup');
  59  |     await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
  60  |     await page.click('.button-modal button:has-text("Create PO")');
  61  |     
  62  |     const [poResponse] = await Promise.all([
  63  |       page.waitForResponse(res => res.url().includes('/api/quotation/moveToPo/') && res.status() === 200),
  64  |       page.click('button:has-text("Yes")')
  65  |     ]);
  66  |     
  67  |     let poId = null;
  68  |     if (poResponse) {
  69  |       const poBody = await poResponse.json();
  70  |       if (poBody?.data?.id) poId = poBody.data.id;
  71  |     }
  72  |     
  73  |     await page.waitForURL(/.*purchase-order/, { timeout: 15000 });
  74  |     await closeModal(page);
  75  | 
  76  |     // Login Finance
  77  |     await page.evaluate(() => localStorage.clear());
  78  |     await page.goto('/login');
  79  |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  80  |     await page.fill('input[type="password"]', 'password');
  81  |     await page.click('button[type="submit"]');
  82  |     await page.waitForURL('**/menu', { timeout: 20000 });
  83  | 
  84  |     // Create PI
  85  |     if (poId) await page.goto(`/purchase-order/${poId}`);
  86  |     else {
  87  |       await page.goto('/purchase-order');
  88  |       await page.locator('.list .item').first().click();
  89  |     }
  90  |     await page.waitForLoadState('networkidle', { timeout: 10000 });
> 91  |     await page.click('button:has-text("Create PI")');
      |                ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  92  |     await page.fill('.modal-body textarea', 'PI for Invoice');
  93  |     await page.click('.button-modal button:has-text("Create PI")');
  94  |     const [piResponse] = await Promise.all([
  95  |       page.waitForResponse(res => res.url().includes('/api/purchase-order/moveToPi/') && res.status() === 200),
  96  |       page.click('button:has-text("Yes")')
  97  |     ]);
  98  |     
  99  |     let piId = null;
  100 |     if (piResponse) {
  101 |       const piBody = await piResponse.json();
  102 |       if (piBody?.data?.id) piId = piBody.data.id;
  103 |     }
  104 |     await page.waitForURL(/.*proforma-invoice/, { timeout: 15000 });
  105 |     await closeModal(page);
  106 | 
  107 |     // Full Pay PI -> Creates Invoice
  108 |     if (piId) await page.goto(`/proforma-invoice/${piId}`);
  109 |     else {
  110 |       await page.goto('/proforma-invoice');
  111 |       await page.locator('.list .item').first().click();
  112 |     }
  113 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  114 |     
  115 |     const fullPaidBtn = page.locator('button:has-text("Create Invoice")');
  116 |     await expect(fullPaidBtn).toBeVisible({ timeout: 15000 });
  117 |     await fullPaidBtn.click();
  118 |     await page.click('button:has-text("Yes")');
  119 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  120 |     await closeModal(page);
  121 |   });
  122 | 
  123 |   test('INV-API-001: View Invoice List and Details (Finance)', async () => {
  124 |     // Navigate to Invoice list
  125 |     await page.goto('/invoice');
  126 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  127 |     
  128 |     await expect(page.locator('.list .item').first()).toBeVisible();
  129 |     await page.screenshot({ path: 'e2e/screenshots/invoice-list.png', fullPage: true });
  130 | 
  131 |     // Open detail
  132 |     await page.locator('.list .item').first().click();
  133 |     // Wait for detail text
  134 |     
  135 |     // Check elements on Invoice Detail
  136 |     await expect(page.locator('.title', { hasText: 'Customer' }).first()).toBeVisible();
  137 |     await page.screenshot({ path: 'e2e/screenshots/invoice-detail.png', fullPage: true });
  138 |   });
  139 | });
  140 | 
```