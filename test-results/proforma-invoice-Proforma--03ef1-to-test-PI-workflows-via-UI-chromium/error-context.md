# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: proforma-invoice.spec.js >> Proforma Invoice E2E Tests (Live DB) >> PI-SETUP: Create a PO to test PI workflows via UI
- Location: e2e\proforma-invoice.spec.js:20:3

# Error details

```
TimeoutError: page.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Yes")')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - navigation [ref=e5]:
        - generic [ref=e6]:
          - link "PT. BMJ" [ref=e8] [cursor=pointer]:
            - /url: /menu
          - generic [ref=e11]:
            - generic [ref=e12]:
              - generic [ref=e14]: 
              - generic [ref=e15]: Marketing
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
            - generic [ref=e26] [cursor=pointer]:
              - generic [ref=e28]: 
              - generic [ref=e29]: Spareparts
              - generic [ref=e30]: 
            - text:  
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]:
            - generic [ref=e34]:
              - generic [ref=e36]: 
              - generic [ref=e37]: Detail Quotation
            - button "Track" [ref=e39] [cursor=pointer]
          - generic [ref=e41]:
            - generic [ref=e42]: Hello, Citra
            - link [ref=e45] [cursor=pointer]:
              - /url: "#"
              - img [ref=e46]: 
        - generic [ref=e48]:
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e52]: Project
              - generic [ref=e53]:
                - generic [ref=e54]:
                  - generic [ref=e55]:
                    - generic [ref=e56]: No Quotation
                    - textbox "No Quotation" [disabled] [ref=e57]: QUOT/28/BMJ-MEGAH/JKT/3/VI/2026
                  - generic [ref=e58]:
                    - generic [ref=e59]: Date Quotation
                    - textbox [disabled] [ref=e60]:
                      - /placeholder: Date
                      - text: 2026-06-11
                - generic [ref=e62]:
                  - generic [ref=e63]: Project Type
                  - combobox "Project Type" [disabled] [ref=e64]:
                    - option "Select Project Type" [disabled]
                    - option "Spareparts" [selected]
                    - option "Service"
            - generic [ref=e65]:
              - generic [ref=e66]: Customer
              - generic [ref=e67]:
                - generic [ref=e68]:
                  - generic [ref=e69]:
                    - generic [ref=e70]: Company Name
                    - textbox "Company Name" [disabled] [ref=e71]: PT PI Testing
                  - generic [ref=e72]:
                    - generic [ref=e73]: Address
                    - textbox "Address" [disabled] [ref=e74]: Jl. PI 123
                  - generic [ref=e76]:
                    - generic [ref=e77]:
                      - generic [ref=e78]: City
                      - textbox "City" [disabled] [ref=e79]: Jakarta
                    - generic [ref=e80]:
                      - generic [ref=e81]: Province
                      - textbox "Province" [disabled] [ref=e82]: DKI Jakarta
                - generic [ref=e83]:
                  - generic [ref=e84]:
                    - generic [ref=e85]: Office
                    - textbox "Office" [disabled] [ref=e86]: 021-123456
                  - generic [ref=e88]:
                    - generic [ref=e89]:
                      - generic [ref=e90]: Urban
                      - textbox "Urban" [disabled] [ref=e91]: Kelurahan Test
                    - generic [ref=e92]:
                      - generic [ref=e93]: Subdistrict
                      - textbox "Subdistrict" [disabled] [ref=e94]: Kecamatan Test
                  - generic [ref=e95]:
                    - generic [ref=e96]: Postal Code
                    - textbox "Postal Code" [disabled] [ref=e97]: "12345"
                  - generic [ref=e98]:
                    - generic [ref=e99]: Email (optional)
                    - textbox "Email" [disabled] [ref=e100]
            - generic [ref=e101]:
              - generic [ref=e102]: Sparepart
              - table [ref=e104]:
                - rowgroup [ref=e105]:
                  - row "NO PART NAME PART NUMBER QUANTITY UNIT UNIT PRICE TOTAL PRICE STOCK" [ref=e106]:
                    - columnheader "NO" [ref=e107]
                    - columnheader "PART NAME" [ref=e108]
                    - columnheader "PART NUMBER" [ref=e109]
                    - columnheader "QUANTITY" [ref=e110]
                    - columnheader "UNIT" [ref=e111]
                    - columnheader "UNIT PRICE" [ref=e112]
                    - columnheader "TOTAL PRICE" [ref=e113]
                    - columnheader "STOCK" [ref=e114]
                - rowgroup [ref=e115]:
                  - row "1 E2E Guaranteed Stock Sparepart E2E-SPAREPART-001 2 pcs Rp 150.000 Rp 300.000 available" [ref=e116]:
                    - cell "1" [ref=e117]
                    - cell "E2E Guaranteed Stock Sparepart" [ref=e118]
                    - cell "E2E-SPAREPART-001" [ref=e119]
                    - cell "2" [ref=e120]
                    - cell "pcs" [ref=e121]
                    - cell "Rp 150.000" [ref=e122]
                    - cell "Rp 300.000" [ref=e123]
                    - cell "available" [ref=e124]
                  - row "SubTotal Rp 300.000" [ref=e125]:
                    - cell [ref=e126]
                    - cell [ref=e127]
                    - cell "SubTotal" [ref=e128]
                    - cell [ref=e129]
                    - cell [ref=e130]
                    - cell [ref=e131]
                    - cell "Rp 300.000" [ref=e132]
                    - cell [ref=e133]
                  - row "PPN 11% Rp 33.000" [ref=e134]:
                    - cell [ref=e135]
                    - cell [ref=e136]
                    - cell "PPN 11%" [ref=e137]
                    - cell [ref=e138]
                    - cell [ref=e139]
                    - cell [ref=e140]
                    - cell "Rp 33.000" [ref=e141]
                    - cell [ref=e142]
                  - row "Grand Total Rp 333.000" [ref=e143]:
                    - cell [ref=e144]
                    - cell [ref=e145]
                    - cell "Grand Total" [ref=e146]
                    - cell [ref=e147]
                    - cell [ref=e148]
                    - cell [ref=e149]
                    - cell "Rp 333.000" [ref=e150]
                    - cell [ref=e151]
            - generic [ref=e152]:
              - generic [ref=e153]:
                - generic [ref=e154]: Total Amount
                - generic [ref=e155]: ": Rp 300.000"
              - generic [ref=e156]:
                - generic [ref=e157]: Total Discount (%)
                - generic [ref=e158]:
                  - text: ":"
                  - spinbutton [ref=e159]: "0"
                  - generic [ref=e160]: Any value > 0 requires Director review.
              - generic [ref=e161]:
                - generic [ref=e162]: Discount
                - generic [ref=e163]: ": Rp 0"
              - generic [ref=e164]:
                - generic [ref=e165]: Subtotal
                - generic [ref=e166]: ": Rp 300.000"
              - generic [ref=e167]:
                - generic [ref=e168]: PPN
                - generic [ref=e169]: ": Rp 33.000"
              - generic [ref=e170]:
                - generic [ref=e171]: Grand Total
                - generic [ref=e172]: ": Rp 333.000"
            - generic [ref=e173]:
              - generic [ref=e174]: Notes
              - textbox "Notes" [disabled] [ref=e176]: Setup PI PO
          - generic [ref=e177]:
            - generic [ref=e178]:
              - button "Edit" [ref=e179] [cursor=pointer]
              - button "Print" [ref=e180] [cursor=pointer]
            - button "Create PO" [ref=e182] [cursor=pointer]
    - generic [ref=e185]:
      - img [ref=e187]: 
      - generic [ref=e191]: Failed
      - generic [ref=e192]: No PO is required.
      - button "Close" [ref=e194] [cursor=pointer]
  - generic [ref=e196]:
    - generic "Toggle devtools panel" [ref=e197] [cursor=pointer]:
      - img [ref=e198]
    - generic "Toggle Component Inspector" [ref=e203] [cursor=pointer]:
      - img [ref=e204]
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
  65  |     await page.click('.button-modal button:has-text("Create PO")');
> 66  |     await page.click('button:has-text("Yes")');
      |                ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  67  |     await closeModal(page);
  68  | 
  69  |     // Extract PO ID
  70  |     const poUrl = page.url();
  71  |     poId = poUrl.split('/').pop();
  72  |     await page.screenshot({ path: 'e2e/screenshots/pi-setup-success.png', fullPage: true });
  73  |   });
  74  | 
  75  |   test('PI-API-008 & UI-PI-009: Move PO to PI & Check UI', async () => {
  76  |     // Logout Marketing and Login as Finance
  77  |     await page.evaluate(() => localStorage.clear());
  78  |     await page.goto('/login');
  79  |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  80  |     await page.fill('input[type="password"]', 'password');
  81  |     await page.click('button[type="submit"]');
  82  |     await page.waitForURL('**/menu', { timeout: 20000 });
  83  | 
  84  |     await page.goto('/purchase-order');
  85  |     await page.locator('.list .item').first().click();
  86  |     
  87  |     await page.click('button:has-text("Create PI")');
  88  |     await page.fill('.modal-body textarea', 'DP 50% for PI');
  89  |     await page.click('.button-modal button:has-text("Create PI")');
  90  |     await page.click('button:has-text("Yes")');
  91  |     await expect(page).toHaveURL(/.*proforma-invoice/, { timeout: 20000 });
  92  |     await closeModal(page);
  93  |     
  94  |     const piUrl = page.url();
  95  |     piId = piUrl.split('/').pop();
  96  | 
  97  |     await page.screenshot({ path: 'e2e/screenshots/pi-api-008-move-to-pi.png', fullPage: true });
  98  |   });
  99  | 
  100 |   test('PI-API-003: Pay Down Payment (DP)', async () => {
  101 |     await page.goto('/proforma-invoice');
  102 |     await page.locator('.list .item').first().click();
  103 |     
  104 |     const dpPaidBtn = page.locator('button:has-text("DP Paid")');
  105 |     await expect(dpPaidBtn).toBeVisible({ timeout: 15000 });
  106 |     
  107 |     // Edit PI to set Down Payment
  108 |     await page.click('button.btn-edit');
  109 |     await page.fill('input[placeholder="Advance Payment"]', '200000');
  110 |     await page.click('button:has-text("Save")');
  111 |     await page.click('button:has-text("Yes")');
  112 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  113 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  114 |     await closeModal(page);
  115 | 
  116 |     await dpPaidBtn.click();
  117 |     
  118 |     await page.click('button:has-text("Yes")');
  119 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  120 |     await closeModal(page);
  121 | 
  122 |     await page.screenshot({ path: 'e2e/screenshots/pi-api-003-dp-paid.png', fullPage: true });
  123 |     await expect(dpPaidBtn).not.toBeVisible();
  124 |   });
  125 | 
  126 |   test('PI-API-005: Pay Full -> Creates Invoice', async () => {
  127 |     await page.goto('/proforma-invoice');
  128 |     await page.locator('.list .item').first().click();
  129 |     
  130 |     const fullPaidBtn = page.locator('button:has-text("Create Invoice")');
  131 |     await expect(fullPaidBtn).toBeVisible({ timeout: 15000 });
  132 |     await fullPaidBtn.click();
  133 |     
  134 |     await page.click('button:has-text("Yes")');
  135 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  136 |     await closeModal(page);
  137 | 
  138 |     await page.screenshot({ path: 'e2e/screenshots/pi-api-005-full-paid.png', fullPage: true });
  139 |     
  140 |     // Verify Invoice exists
  141 |     await page.goto('/invoice');
  142 |     await expect(page.locator('.list .item').first()).toBeVisible();
  143 |   });
  144 | 
  145 |   test('PI-API-008 (Negative): Finance & Director roles only', async () => {
  146 |     // Login as Inventory Admin
  147 |     await page.evaluate(() => localStorage.clear());
  148 |     await page.goto('/login');
  149 |     await page.fill('input[type="email"]', 'eko.p@bmj.com');
  150 |     await page.fill('input[type="password"]', 'password');
  151 |     await page.click('button[type="submit"]');
  152 |     await page.waitForURL('**/menu', { timeout: 20000 });
  153 | 
  154 |     const sidebar = page.locator('.sidebar');
  155 |     await expect(sidebar.locator('text="Proforma Invoice"')).not.toBeVisible();
  156 |     await page.screenshot({ path: 'e2e/screenshots/pi-api-008-role-block.png', fullPage: true });
  157 |   });
  158 | });
  159 | 
```