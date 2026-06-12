# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: backorder-buy.spec.js >> Back Order & Buy (Procurement) E2E Tests >> BO-SETUP: Create Indent Quotation -> PO -> Release -> Creates Back Order
- Location: e2e\backorder-buy.spec.js:18:3

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
                    - textbox "No Quotation" [disabled] [ref=e57]: QUOT/2/BMJ-MEGAH/JKT/3/VI/2026
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
                    - textbox "Company Name" [disabled] [ref=e71]: PT BO Testing
                  - generic [ref=e72]:
                    - generic [ref=e73]: Address
                    - textbox "Address" [disabled] [ref=e74]: Jl. BO 123
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
                  - row "1 E2E Low Stock Sparepart E2E-LOW-001 50 pcs Rp 75.000 Rp 3.750.000 indent" [ref=e116]:
                    - cell "1" [ref=e117]
                    - cell "E2E Low Stock Sparepart" [ref=e118]
                    - cell "E2E-LOW-001" [ref=e119]
                    - cell "50" [ref=e120]
                    - cell "pcs" [ref=e121]
                    - cell "Rp 75.000" [ref=e122]
                    - cell "Rp 3.750.000" [ref=e123]
                    - cell "indent" [ref=e124]
                  - row "SubTotal Rp 3.750.000" [ref=e125]:
                    - cell [ref=e126]
                    - cell [ref=e127]
                    - cell "SubTotal" [ref=e128]
                    - cell [ref=e129]
                    - cell [ref=e130]
                    - cell [ref=e131]
                    - cell "Rp 3.750.000" [ref=e132]
                    - cell [ref=e133]
                  - row "PPN 11% Rp 412.500" [ref=e134]:
                    - cell [ref=e135]
                    - cell [ref=e136]
                    - cell "PPN 11%" [ref=e137]
                    - cell [ref=e138]
                    - cell [ref=e139]
                    - cell [ref=e140]
                    - cell "Rp 412.500" [ref=e141]
                    - cell [ref=e142]
                  - row "Grand Total Rp 4.162.500" [ref=e143]:
                    - cell [ref=e144]
                    - cell [ref=e145]
                    - cell "Grand Total" [ref=e146]
                    - cell [ref=e147]
                    - cell [ref=e148]
                    - cell [ref=e149]
                    - cell "Rp 4.162.500" [ref=e150]
                    - cell [ref=e151]
            - generic [ref=e152]:
              - generic [ref=e153]:
                - generic [ref=e154]: Total Amount
                - generic [ref=e155]: ": Rp 3.750.000"
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
                - generic [ref=e166]: ": Rp 3.750.000"
              - generic [ref=e167]:
                - generic [ref=e168]: PPN
                - generic [ref=e169]: ": Rp 412.500"
              - generic [ref=e170]:
                - generic [ref=e171]: Grand Total
                - generic [ref=e172]: ": Rp 4.162.500"
            - generic [ref=e173]:
              - generic [ref=e174]: Notes
              - textbox "Notes" [disabled] [ref=e176]: Setup BO PO
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
  4   | test.describe('Back Order & Buy (Procurement) E2E Tests', () => {
  5   |   test.describe.configure({ mode: 'serial' });
  6   | 
  7   |   let page;
  8   |   let indentPoId = '';
  9   | 
  10  |   test.beforeAll(async ({ browser }) => {
  11  |     page = await browser.newPage();
  12  |   });
  13  | 
  14  |   test.afterAll(async () => {
  15  |     await page.close();
  16  |   });
  17  | 
  18  |   test('BO-SETUP: Create Indent Quotation -> PO -> Release -> Creates Back Order', async () => {
  19  |     test.setTimeout(600000); // 5 minutes for this mega-test for this long flow
  20  |     // 1. Login as Marketing
  21  |     await page.goto('/login');
  22  |     await page.fill('input[type="email"]', 'citra.k@bmj.com');
  23  |     await page.fill('input[type="password"]', 'password');
  24  |     await page.click('button[type="submit"]');
  25  |     await page.waitForURL('**/menu', { timeout: 20000 });
  26  | 
  27  |     // 2. Create Indent Quotation
  28  |     await page.goto('/quotation/add');
  29  |     await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
  30  |     await page.fill('input[placeholder="Company Name"]', 'PT BO Testing');
  31  |     await page.fill('input[placeholder="Address"]', 'Jl. BO 123');
  32  |     await page.fill('input[placeholder="City"]', 'Jakarta');
  33  |     await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
  34  |     await page.fill('input[placeholder="Office"]', '021-123456');
  35  |     await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
  36  |     await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
  37  |     await page.fill('input[placeholder="Postal Code"]', '12345');
  38  |     await page.fill('textarea[placeholder="Notes"]', 'Setup BO PO');
  39  |     
  40  |     // Add Sparepart (Indent quantity)
  41  |     await page.click('button:has-text("Add Sparepart")');
  42  |     const firstRow = page.locator('.add-sparepart .list.row').first();
  43  |     const partNameInput = firstRow.locator('input[placeholder="Part Name"]');
  44  |     // Robust autocomplete: arm the search waiter, type char-by-char, await the API.
  45  |     const boSearch = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
  46  |     await partNameInput.pressSequentially('E2E Low Stock Sparepart', { delay: 30 });
  47  |     await boSearch;
  48  |     await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Low Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
  49  |     await firstRow.locator('.dropdown-item', { hasText: 'E2E Low Stock Sparepart' }).first().click();
  50  |     
  51  |     // Fill large quantity to trigger indent (more than 10 stock)
  52  |     await firstRow.locator('input[placeholder="Quantity"]').fill('50');
  53  |     await firstRow.locator('input[placeholder="Unit Price"]').blur();
  54  |     
  55  |     await page.click('button.btn-process:has-text("Add Quotation")');
  56  |     await page.click('button:has-text("Yes")');
  57  |     await closeModal(page);
  58  |     
  59  |     // 3. Move to PO — intercept API response to capture new PO ID
  60  |     await page.locator('.list .item').first().click();
  61  |     await page.click('button:has-text("Create PO")');
  62  |     await page.fill('.modal-body textarea', 'Move to PO setup for BO');
  63  |     await page.click('.button-modal button:has-text("Create PO")');
  64  |     
  65  |     const [poResponse] = await Promise.all([
> 66  |       page.waitForResponse(res => res.url().includes('/api/quotation/moveToPo/') && res.status() === 200),
      |            ^ TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
  67  |       page.click('button:has-text("Yes")')
  68  |     ]);
  69  |     
  70  |     if (poResponse) {
  71  |       const body = await poResponse.json();
  72  |       if (body?.data?.id) indentPoId = body.data.id;
  73  |     }
  74  |     
  75  |     await page.waitForURL(/.*purchase-order/, { timeout: 15000 });
  76  |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  77  |     await closeModal(page);
  78  | 
  79  |     // 4. Set PO Ready and Release -> Creates DO and BO (Since it is Indent)
  80  |     // First, Create PI and Pay DP as Finance
  81  |     await page.evaluate(() => localStorage.clear());
  82  |     await page.goto('/login');
  83  |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  84  |     await page.fill('input[type="password"]', 'password');
  85  |     await page.click('button[type="submit"]');
  86  |     await page.waitForURL('**/menu', { timeout: 20000 });
  87  | 
  88  |     if (indentPoId) {
  89  |       await page.goto(`/purchase-order/${indentPoId}`);
  90  |     } else {
  91  |       await page.goto('/purchase-order');
  92  |       await page.locator('.list .item').first().click();
  93  |     }
  94  |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  95  |     
  96  |     // Create PI
  97  |     await page.click('button:has-text("Create PI")');
  98  |     await page.fill('.modal-body textarea', 'DP for Indent BO');
  99  |     await page.click('.button-modal button:has-text("Create PI")');
  100 |     
  101 |     const [piResponse] = await Promise.all([
  102 |       page.waitForResponse(res => res.url().includes('/api/purchase-order/moveToPi/') && res.status() === 200),
  103 |       page.click('button:has-text("Yes")')
  104 |     ]);
  105 |     
  106 |     let capturedPiId = null;
  107 |     if (piResponse) {
  108 |       const piBody = await piResponse.json();
  109 |       if (piBody?.data?.id) capturedPiId = piBody.data.id;
  110 |     }
  111 |     
  112 |     await expect(page).toHaveURL(/.*proforma-invoice/, { timeout: 20000 });
  113 |     await closeModal(page);
  114 | 
  115 |     // Pay DP
  116 |     if (capturedPiId) {
  117 |       await page.goto(`/proforma-invoice/${capturedPiId}`);
  118 |     } else {
  119 |       await page.goto('/proforma-invoice');
  120 |       await page.waitForSelector('.list .item', { timeout: 10000 });
  121 |       await page.locator('.list .item').first().click();
  122 |     }
  123 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  124 |     
  125 |     // Edit PI to set Down Payment
  126 |     await page.click('button.btn-edit');
  127 |     await page.fill('input[placeholder="Advance Payment"]', '100000');
  128 |     await page.click('button:has-text("Save")');
  129 |     await page.click('button:has-text("Yes")');
  130 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  131 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  132 |     await closeModal(page);
  133 | 
  134 |     await page.click('button:has-text("DP Paid")');
  135 |     await page.click('button:has-text("Yes")');
  136 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  137 |     await closeModal(page);
  138 | 
  139 |     // Now Login as Inventory Admin
  140 |     await page.evaluate(() => localStorage.clear());
  141 |     await page.goto('/login');
  142 |     await page.fill('input[type="email"]', 'eko.p@bmj.com');
  143 |     await page.fill('input[type="password"]', 'password');
  144 |     await page.click('button[type="submit"]');
  145 |     await page.waitForURL('**/menu', { timeout: 20000 });
  146 | 
  147 |     // Navigate directly to the indent PO (or fallback to list)
  148 |     if (indentPoId) {
  149 |       await page.goto(`/purchase-order/${indentPoId}`);
  150 |     } else {
  151 |       await page.goto('/purchase-order');
  152 |       await page.waitForSelector('.list .item', { timeout: 10000 });
  153 |       await page.locator('.list .item').first().click();
  154 |     }
  155 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  156 |     
  157 |     // In a Back Order flow, the PO automatically creates a Back Order upon creation if stock is insufficient.
  158 |     // The PO is stuck in BO status and CANNOT be marked Ready or Released until the Back Order is resolved via Buy.
  159 |     // So we just verify that the Back Order exists.
  160 |     await page.goto('/back-order');
  161 | 
  162 | 
  163 |     // Verify BO exists
  164 |     await page.goto('/back-order');
  165 |     await expect(page.locator('.list .item').first()).toBeVisible();
  166 |     await page.screenshot({ path: 'e2e/screenshots/bo-setup-success.png', fullPage: true });
```