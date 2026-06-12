# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: invoice.spec.js >> Invoice E2E Tests (Live DB) >> INV-SETUP: Create Full Pipeline to generate Invoice
- Location: e2e\invoice.spec.js:17:3

# Error details

```
TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
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
                    - textbox "No Quotation" [disabled] [ref=e57]: QUOT/20/BMJ-MEGAH/JKT/3/VI/2026
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
                    - textbox "Company Name" [disabled] [ref=e71]: PT Invoice Test
                  - generic [ref=e72]:
                    - generic [ref=e73]: Address
                    - textbox "Address" [disabled] [ref=e74]: Jl. Invoice 123
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
                  - row "1 E2E Guaranteed Stock Sparepart E2E-SPAREPART-001 1 pcs Rp 150.000 Rp 150.000 available" [ref=e116]:
                    - cell "1" [ref=e117]
                    - cell "E2E Guaranteed Stock Sparepart" [ref=e118]
                    - cell "E2E-SPAREPART-001" [ref=e119]
                    - cell "1" [ref=e120]
                    - cell "pcs" [ref=e121]
                    - cell "Rp 150.000" [ref=e122]
                    - cell "Rp 150.000" [ref=e123]
                    - cell "available" [ref=e124]
                  - row "SubTotal Rp 150.000" [ref=e125]:
                    - cell [ref=e126]
                    - cell [ref=e127]
                    - cell "SubTotal" [ref=e128]
                    - cell [ref=e129]
                    - cell [ref=e130]
                    - cell [ref=e131]
                    - cell "Rp 150.000" [ref=e132]
                    - cell [ref=e133]
                  - row "PPN 11% Rp 16.500" [ref=e134]:
                    - cell [ref=e135]
                    - cell [ref=e136]
                    - cell "PPN 11%" [ref=e137]
                    - cell [ref=e138]
                    - cell [ref=e139]
                    - cell [ref=e140]
                    - cell "Rp 16.500" [ref=e141]
                    - cell [ref=e142]
                  - row "Grand Total Rp 166.500" [ref=e143]:
                    - cell [ref=e144]
                    - cell [ref=e145]
                    - cell "Grand Total" [ref=e146]
                    - cell [ref=e147]
                    - cell [ref=e148]
                    - cell [ref=e149]
                    - cell "Rp 166.500" [ref=e150]
                    - cell [ref=e151]
            - generic [ref=e152]:
              - generic [ref=e153]:
                - generic [ref=e154]: Total Amount
                - generic [ref=e155]: ": Rp 150.000"
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
                - generic [ref=e166]: ": Rp 150.000"
              - generic [ref=e167]:
                - generic [ref=e168]: PPN
                - generic [ref=e169]: ": Rp 16.500"
              - generic [ref=e170]:
                - generic [ref=e171]: Grand Total
                - generic [ref=e172]: ": Rp 166.500"
            - generic [ref=e173]:
              - generic [ref=e174]: Notes
              - textbox "Notes" [disabled] [ref=e176]: Setup Invoice
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
  59  |     await page.click('.button-modal button:has-text("Create PO")');
  60  |     
  61  |     const [poResponse] = await Promise.all([
> 62  |       page.waitForResponse(res => res.url().includes('/api/quotation/moveToPo/') && res.status() === 200),
      |            ^ TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
  63  |       page.click('button:has-text("Yes")')
  64  |     ]);
  65  |     
  66  |     let poId = null;
  67  |     if (poResponse) {
  68  |       const poBody = await poResponse.json();
  69  |       if (poBody?.data?.id) poId = poBody.data.id;
  70  |     }
  71  |     
  72  |     await page.waitForURL(/.*purchase-order/, { timeout: 15000 });
  73  |     await closeModal(page);
  74  | 
  75  |     // Login Finance
  76  |     await page.evaluate(() => localStorage.clear());
  77  |     await page.goto('/login');
  78  |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  79  |     await page.fill('input[type="password"]', 'password');
  80  |     await page.click('button[type="submit"]');
  81  |     await page.waitForURL('**/menu', { timeout: 20000 });
  82  | 
  83  |     // Create PI
  84  |     if (poId) await page.goto(`/purchase-order/${poId}`);
  85  |     else {
  86  |       await page.goto('/purchase-order');
  87  |       await page.locator('.list .item').first().click();
  88  |     }
  89  |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  90  |     await page.click('button:has-text("Create PI")');
  91  |     await page.fill('.modal-body textarea', 'PI for Invoice');
  92  |     await page.click('.button-modal button:has-text("Create PI")');
  93  |     const [piResponse] = await Promise.all([
  94  |       page.waitForResponse(res => res.url().includes('/api/purchase-order/moveToPi/') && res.status() === 200),
  95  |       page.click('button:has-text("Yes")')
  96  |     ]);
  97  |     
  98  |     let piId = null;
  99  |     if (piResponse) {
  100 |       const piBody = await piResponse.json();
  101 |       if (piBody?.data?.id) piId = piBody.data.id;
  102 |     }
  103 |     await page.waitForURL(/.*proforma-invoice/, { timeout: 15000 });
  104 |     await closeModal(page);
  105 | 
  106 |     // Full Pay PI -> Creates Invoice
  107 |     if (piId) await page.goto(`/proforma-invoice/${piId}`);
  108 |     else {
  109 |       await page.goto('/proforma-invoice');
  110 |       await page.locator('.list .item').first().click();
  111 |     }
  112 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  113 |     
  114 |     const fullPaidBtn = page.locator('button:has-text("Create Invoice")');
  115 |     await expect(fullPaidBtn).toBeVisible({ timeout: 15000 });
  116 |     await fullPaidBtn.click();
  117 |     await page.click('button:has-text("Yes")');
  118 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  119 |     await closeModal(page);
  120 |   });
  121 | 
  122 |   test('INV-API-001: View Invoice List and Details (Finance)', async () => {
  123 |     // Navigate to Invoice list
  124 |     await page.goto('/invoice');
  125 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  126 |     
  127 |     await expect(page.locator('.list .item').first()).toBeVisible();
  128 |     await page.screenshot({ path: 'e2e/screenshots/invoice-list.png', fullPage: true });
  129 | 
  130 |     // Open detail
  131 |     await page.locator('.list .item').first().click();
  132 |     // Wait for detail text
  133 |     
  134 |     // Check elements on Invoice Detail
  135 |     await expect(page.locator('.title', { hasText: 'Customer' }).first()).toBeVisible();
  136 |     await page.screenshot({ path: 'e2e/screenshots/invoice-detail.png', fullPage: true });
  137 |   });
  138 | });
  139 | 
```