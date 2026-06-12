# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: purchase-order-negative.spec.js >> Purchase Order Decline & Negative Flow >> PO-DECLINE-SETUP: Create a Purchase Order for negative testing
- Location: e2e\purchase-order-negative.spec.js:18:3

# Error details

```
TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
```

```
Error: page.click: Target page, context or browser has been closed
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
                    - textbox "No Quotation" [disabled] [ref=e57]: QUOT/29/BMJ-MEGAH/JKT/3/VI/2026
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
                    - textbox "Company Name" [disabled] [ref=e71]: PT Negative Test
                  - generic [ref=e72]:
                    - generic [ref=e73]: Address
                    - textbox "Address" [disabled] [ref=e74]: Jl. Negative
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
              - textbox "Notes" [disabled] [ref=e176]: Negative Test PO
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
  4   | test.describe('Purchase Order Decline & Negative Flow', () => {
  5   |   test.describe.configure({ mode: 'serial' });
  6   | 
  7   |   let page;
  8   |   let poId = '';
  9   | 
  10  |   test.beforeAll(async ({ browser }) => {
  11  |     page = await browser.newPage();
  12  |   });
  13  | 
  14  |   test.afterAll(async () => {
  15  |     await page.close();
  16  |   });
  17  | 
  18  |   test('PO-DECLINE-SETUP: Create a Purchase Order for negative testing', async () => {
  19  |     // Login as Marketing
  20  |     await page.goto('/login');
  21  |     await page.fill('input[type="email"]', 'citra.k@bmj.com');
  22  |     await page.fill('input[type="password"]', 'password');
  23  |     await page.click('button[type="submit"]');
  24  |     await page.waitForURL('**/menu', { timeout: 20000 });
  25  | 
  26  |     // Create Quotation
  27  |     await page.goto('/quotation/add');
  28  |     await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
  29  |     await page.fill('input[placeholder="Company Name"]', 'PT Negative Test');
  30  |     await page.fill('input[placeholder="Address"]', 'Jl. Negative');
  31  |     await page.fill('input[placeholder="City"]', 'Jakarta');
  32  |     await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
  33  |     await page.fill('input[placeholder="Office"]', '021-123456');
  34  |     await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
  35  |     await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
  36  |     await page.fill('input[placeholder="Postal Code"]', '12345');
  37  |     await page.fill('textarea[placeholder="Notes"]', 'Negative Test PO');
  38  |     
  39  |     // Add Sparepart
  40  |     await page.click('button:has-text("Add Sparepart")');
  41  |     const firstRow = page.locator('.add-sparepart .list.row').first();
  42  |     // Robust autocomplete: arm the search waiter, type char-by-char, await the API.
  43  |     const ponSearch = page.waitForResponse((r) => r.url().includes('/api/sparepart') && r.status() === 200);
  44  |     await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('E2E Guaranteed Stock Sparepart', { delay: 30 });
  45  |     await ponSearch;
  46  |     await expect(firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first()).toBeVisible({ timeout: 10000 });
  47  |     await firstRow.locator('.dropdown-item', { hasText: 'E2E Guaranteed Stock Sparepart' }).first().click();
  48  |     
  49  |     // Set quantity
  50  |     await firstRow.locator('input[placeholder="Quantity"]').fill('1');
  51  |     await firstRow.locator('input[placeholder="Unit Price"]').blur();
  52  |     
  53  |     await page.click('button.btn-process:has-text("Add Quotation")');
  54  |     await page.click('button:has-text("Yes")');
  55  |     await closeModal(page);
  56  |     await expect(page).toHaveURL(/.*quotation/, { timeout: 20000 });
  57  | 
  58  |     // Move to PO
  59  |     const responsePromise = page.waitForResponse(response => 
  60  |       response.url().includes('/moveToPo') && response.request().method() === 'POST'
  61  |     );
  62  |     await page.locator('.list .item').first().click();
  63  |     const createPoBtn = page.locator('button:has-text("Create PO")');
  64  |     await expect(createPoBtn).toBeVisible({ timeout: 15000 });
  65  |     await createPoBtn.click();
  66  |     await page.fill('.modal-body textarea', 'Move to PO negative setup');
  67  |     await page.click('.button-modal button:has-text("Create PO")');
> 68  |     await page.click('button:has-text("Yes")');
      |                ^ Error: page.click: Target page, context or browser has been closed
  69  |     
  70  |     const response = await responsePromise;
  71  |     const json = await response.json();
  72  |     poId = json.data.id;
  73  |     
  74  |     await expect(page).toHaveURL(/.*purchase-order/, { timeout: 20000 });
  75  |     await closeModal(page);
  76  |     await page.screenshot({ path: 'e2e/screenshots/po-decline-setup.png', fullPage: true });
  77  |   });
  78  | 
  79  |   test('PO-API-025: Decline PO — Marketing role blocked (UI Button Missing)', async () => {
  80  |     // Marketing is already logged in
  81  |     await page.goto('/purchase-order');
  82  |     await page.locator('.list .item').first().click();
  83  |     
  84  |     // The "Reject PO" button should not be visible for Marketing
  85  |     const rejectBtn = page.locator('button:has-text("Reject PO")');
  86  |     await expect(rejectBtn).not.toBeVisible();
  87  |     await page.screenshot({ path: 'e2e/screenshots/po-api-025-marketing-blocked.png', fullPage: true });
  88  |   });
  89  | 
  90  |   test('PO-API-023: Decline PO — Finance role', async () => {
  91  |     // Login as Finance
  92  |     await page.evaluate(() => localStorage.clear());
  93  |     await page.goto('/login');
  94  |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  95  |     await page.fill('input[type="password"]', 'password');
  96  |     await page.click('button[type="submit"]');
  97  |     await page.waitForURL('**/menu', { timeout: 20000 });
  98  | 
  99  |     // Navigate to PO
  100 |     await page.goto(`/purchase-order/${poId}`);
  101 |     
  102 |     const rejectBtn = page.locator('button:has-text("Reject PO")');
  103 |     // Finance should be able to see and click Reject PO based on the test case
  104 |     await expect(rejectBtn).toBeVisible();
  105 |     await rejectBtn.click();
  106 |     
  107 |     // Test validation: notes required (PO-API-026 implicitly via UI if applicable)
  108 |     // For now, let's just reject it
  109 |     await page.fill('.modal-body textarea', 'Budget exceeded');
  110 |     
  111 |     const rejectResponsePromise = page.waitForResponse(response => 
  112 |       response.url().includes('/reject/') && response.request().method() === 'POST'
  113 |     );
  114 |     
  115 |     await page.click('.button-modal button:has-text("Reject")');
  116 |     await page.click('button:has-text("Yes")');
  117 |     
  118 |     const rejectResponse = await rejectResponsePromise;
  119 |     console.log(`Reject API Status: ${rejectResponse.status()}`);
  120 |     console.log(`Reject API Body:`, await rejectResponse.json());
  121 |     
  122 |     // Check success
  123 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  124 |     
  125 |     // Check status is rejected in the list
  126 |     await page.goto(`/purchase-order`);
  127 |     await expect(page.locator('.list .item .content').first()).toContainText('Rejected', { ignoreCase: true });
  128 |     await page.screenshot({ path: 'e2e/screenshots/po-api-023-decline-success.png', fullPage: true });
  129 |   });
  130 | });
  131 | 
```