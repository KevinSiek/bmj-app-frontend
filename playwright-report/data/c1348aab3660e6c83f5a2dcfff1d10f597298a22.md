# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: purchase-order.spec.js >> Purchase Order E2E Tests (Live DB) >> PO-SETUP: Create a Purchase Order for testing
- Location: e2e\purchase-order.spec.js:18:3

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
                    - textbox "No Quotation" [disabled] [ref=e57]: QUOT/30/BMJ-MEGAH/JKT/3/VI/2026
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
                    - textbox "Company Name" [disabled] [ref=e71]: PT PO Testing
                  - generic [ref=e72]:
                    - generic [ref=e73]: Address
                    - textbox "Address" [disabled] [ref=e74]: Jl. PO 123
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
              - textbox "Notes" [disabled] [ref=e176]: Setup PO
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
  4   | test.describe('Purchase Order E2E Tests (Live DB)', () => {
  5   |   test.describe.configure({ mode: 'serial' });
  6   | 
  7   |   // Variables to hold generated data
  8   |   let page;
  9   | 
  10  |   test.beforeAll(async ({ browser }) => {
  11  |     page = await browser.newPage();
  12  |   });
  13  | 
  14  |   test.afterAll(async () => {
  15  |     await page.close();
  16  |   });
  17  | 
  18  |   test('PO-SETUP: Create a Purchase Order for testing', async () => {
  19  |     // 1. Login as Marketing
  20  |     await page.goto('/login');
  21  |     await page.fill('input[type="email"]', 'citra.k@bmj.com');
  22  |     await page.fill('input[type="password"]', 'password');
  23  |     await page.click('button[type="submit"]');
  24  |     await page.waitForURL('**/menu', { timeout: 20000 });
  25  | 
  26  |     // 2. Create Quotation
  27  |     await page.goto('/quotation/add');
  28  |     await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
  29  |     await page.fill('input[placeholder="Company Name"]', 'PT PO Testing');
  30  |     await page.fill('input[placeholder="Address"]', 'Jl. PO 123');
  31  |     await page.fill('input[placeholder="City"]', 'Jakarta');
  32  |     await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
  33  |     await page.fill('input[placeholder="Office"]', '021-123456');
  34  |     await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
  35  |     await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
  36  |     await page.fill('input[placeholder="Postal Code"]', '12345');
  37  |     await page.fill('textarea[placeholder="Notes"]', 'Setup PO');
  38  |     
  39  |     // Add Sparepart
  40  |     await page.click('button:has-text("Add Sparepart")');
  41  |     const firstRow = page.locator('.add-sparepart .list.row').first();
  42  |     
  43  |     // Select E2E Guaranteed Stock Sparepart. Robust autocomplete: arm the search
  44  |     // waiter, type char-by-char (pressSequentially fires the debounced input events
  45  |     // that .fill() does not), await the API, then click the item.
  46  |     const partNameInput = firstRow.locator('input[placeholder="Part Name"]');
  47  |     const poSearch = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
  48  |     await partNameInput.pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });
  49  |     await poSearch;
  50  | 
  51  |     // Wait for the dropdown to render and click the exact item
  52  |     await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
  53  |     await firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();
  54  |     
  55  |     // Set quantity
  56  |     await firstRow.locator('input[placeholder="Quantity"]').fill('1');
  57  |     await firstRow.locator('input[placeholder="Unit Price"]').blur();
  58  |     
  59  |     await page.click('button.btn-process:has-text("Add Quotation")');
  60  |     await page.click('button:has-text("Yes")');
  61  |     await closeModal(page);
  62  |     await expect(page).toHaveURL(/.*quotation/, { timeout: 20000 });
  63  | 
  64  |     // 3. Move to PO (Marketing can do this since it's already approved)
  65  |     page.on('response', response => {
  66  |       if (response.url().includes('/moveToPo') && response.request().method() === 'POST') {
  67  |         response.json().then(json => console.log('MOVE TO PO RESPONSE:', json)).catch(e => console.error(e));
  68  |       }
  69  |     });
  70  | 
  71  |     // The UI is already on /quotation page
  72  |     await page.locator('.list .item').first().click();
  73  |     const createPoBtn = page.locator('button:has-text("Create PO")');
  74  |     await expect(createPoBtn).toBeVisible({ timeout: 15000 });
  75  |     await createPoBtn.click();
  76  |     await page.fill('.modal-body textarea', 'Move to PO setup');
  77  |     await page.click('.button-modal button:has-text("Create PO")');
  78  |     // Await the moveToPo API response so the assertion doesn't race the navigation.
  79  |     await Promise.all([
  80  |       page.waitForResponse((r) => r.url().includes('/api/quotation/moveToPo/') && r.status() === 200, { timeout: 20000 }),
> 81  |       page.click('button:has-text("Yes")'),
      |            ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  82  |     ]);
  83  |     await expect(page).toHaveURL(/.*purchase-order/, { timeout: 20000 });
  84  |     await closeModal(page);
  85  | 
  86  |     // Extract PO number for later tests
  87  |     const poRow = page.locator('.list .item').first();
  88  |     await expect(poRow).toBeVisible();
  89  |     await page.screenshot({ path: 'e2e/screenshots/po-setup-success.png', fullPage: true });
  90  |   });
  91  | 
  92  |   test('UI-PO-031: PO detail page shows Track timeline', async () => {
  93  |     // We are still logged in as Director from the setup test!
  94  |     await page.goto('/purchase-order');
  95  |     
  96  |     // Click on the created PO
  97  |     await page.locator('.list .item').first().click();
  98  |     
  99  |     // Click Track button in the top navbar
  100 |     await page.click('.page-title .track .btn');
  101 |     
  102 |     // Verify track component is visible
  103 |     await expect(page.locator('.popup')).toBeVisible();
  104 |     await expect(page.locator('.popup .step').first()).toBeVisible();
  105 |     
  106 |     // Close the track modal/offcanvas
  107 |     await page.locator('.popup .bi-x').click();
  108 |     await page.screenshot({ path: 'e2e/screenshots/po-ui-track-modal.png', fullPage: true });
  109 |   });
  110 | 
  111 |   test('PO-API-008: Move to PI (Finance)', async () => {
  112 |     // Logout Marketing and Login as Finance
  113 |     await page.evaluate(() => localStorage.clear());
  114 |     await page.goto('/login');
  115 |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  116 |     await page.fill('input[type="password"]', 'password');
  117 |     await page.click('button[type="submit"]');
  118 |     await page.waitForURL('**/menu', { timeout: 20000 });
  119 | 
  120 |     // Navigate to PO detail
  121 |     await page.goto('/purchase-order');
  122 |     await closeModal(page, { waitForAppear: 800 }); // clear any leftover modal before clicking
  123 |     await page.locator('.list .item').first().click();
  124 | 
  125 |     // Click 'Create PI'
  126 |     const createPiBtn = page.locator('button:has-text("Create PI")');
  127 |     await expect(createPiBtn).toBeVisible({ timeout: 15000 });
  128 |     await createPiBtn.click();
  129 | 
  130 |     // Fill notes and confirm
  131 |     await page.fill('.modal-body textarea', 'DP 50% for PI');
  132 |     await page.click('.button-modal button:has-text("Create PI")');
  133 |     // Await the moveToPi API response so the URL assertion doesn't race the navigation
  134 |     // (the default 5s toHaveURL is too tight under UI-Mode load).
  135 |     await Promise.all([
  136 |       page.waitForResponse((r) => r.url().includes('/api/purchase-order/moveToPi/') && r.status() === 200, { timeout: 20000 }),
  137 |       page.click('button:has-text("Yes")'),
  138 |     ]);
  139 | 
  140 |     // Should navigate to Proforma Invoice page
  141 |     await expect(page).toHaveURL(/.*proforma-invoice/, { timeout: 20000 });
  142 |     await closeModal(page);
  143 |     
  144 |     // Verify it is now in the PI list
  145 |     await expect(page.locator('.list .item').first()).toBeVisible();
  146 | 
  147 |     // Click the PI to open detail
  148 |     await page.locator('.list .item').first().click();
  149 |     
  150 |     // Click DP Paid
  151 |     const dpPaidBtn = page.locator('button:has-text("DP Paid")');
  152 |     await expect(dpPaidBtn).toBeVisible({ timeout: 15000 });
  153 |     await dpPaidBtn.click();
  154 |     
  155 |     // Confirm
  156 |     await page.click('button:has-text("Yes")');
  157 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  158 |     await page.screenshot({ path: 'e2e/screenshots/po-api-008-move-to-pi.png', fullPage: true });
  159 |   });
  160 | 
  161 |   test('PO-API-012: Set to Ready (Inventory Admin)', async () => {
  162 |     // Login as Inventory Admin
  163 |     await page.evaluate(() => localStorage.clear());
  164 |     await page.goto('/login');
  165 |     await page.fill('input[type="email"]', 'eko.p@bmj.com');
  166 |     await page.fill('input[type="password"]', 'password');
  167 |     await page.click('button[type="submit"]');
  168 |     await page.waitForURL('**/menu', { timeout: 20000 });
  169 | 
  170 |     // Navigate to PO detail
  171 |     await page.goto('/purchase-order');
  172 |     await page.locator('.list .item').first().click();
  173 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  174 |     
  175 |     // Click 'Ready'
  176 |     const readyBtn = page.locator('button:has-text("Ready")');
  177 |     await expect(readyBtn).toBeVisible({ timeout: 15000 });
  178 |     await readyBtn.click();
  179 |     
  180 |     // Wait for confirmation modal then confirm
  181 |     await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
```