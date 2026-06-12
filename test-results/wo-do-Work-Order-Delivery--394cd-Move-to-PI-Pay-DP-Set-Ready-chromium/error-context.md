# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wo-do.spec.js >> Work Order & Delivery Order E2E Tests >> WO-SETUP: Create Service Quotation, Move to PO, Move to PI, Pay DP, Set Ready
- Location: e2e\wo-do.spec.js:20:3

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
                    - textbox "No Quotation" [disabled] [ref=e57]: QUOT/45/BMJ-MEGAH/JKT/3/VI/2026
                  - generic [ref=e58]:
                    - generic [ref=e59]: Date Quotation
                    - textbox [disabled] [ref=e60]:
                      - /placeholder: Date
                      - text: 2026-06-11
                - generic [ref=e62]:
                  - generic [ref=e63]: Project Type
                  - combobox "Project Type" [disabled] [ref=e64]:
                    - option "Select Project Type" [disabled]
                    - option "Spareparts"
                    - option "Service" [selected]
            - generic [ref=e65]:
              - generic [ref=e66]: Customer
              - generic [ref=e67]:
                - generic [ref=e68]:
                  - generic [ref=e69]:
                    - generic [ref=e70]: Company Name
                    - textbox "Company Name" [disabled] [ref=e71]: PT WO Test
                  - generic [ref=e72]:
                    - generic [ref=e73]: Address
                    - textbox "Address" [disabled] [ref=e74]: Jl. WO
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
              - generic [ref=e102]: Service
              - table [ref=e104]:
                - rowgroup [ref=e105]:
                  - row "NO SERVICE NAME QUANTITY UNIT PRICE TOTAL PRICE" [ref=e106]:
                    - columnheader "NO" [ref=e107]
                    - columnheader "SERVICE NAME" [ref=e108]
                    - columnheader "QUANTITY" [ref=e109]
                    - columnheader "UNIT PRICE" [ref=e110]
                    - columnheader "TOTAL PRICE" [ref=e111]
                - rowgroup [ref=e112]:
                  - row "1 E2E Engine Repair 1 Rp 5.000.000 Rp 5.000.000" [ref=e113]:
                    - cell "1" [ref=e114]
                    - cell "E2E Engine Repair" [ref=e115]
                    - cell "1" [ref=e116]
                    - cell "Rp 5.000.000" [ref=e117]
                    - cell "Rp 5.000.000" [ref=e118]
                  - row "SubTotal Rp 5.000.000" [ref=e119]:
                    - cell [ref=e120]
                    - cell [ref=e121]
                    - cell "SubTotal" [ref=e122]
                    - cell [ref=e123]
                    - cell "Rp 5.000.000" [ref=e124]
                  - row "PPN 11% Rp 550.000" [ref=e125]:
                    - cell [ref=e126]
                    - cell [ref=e127]
                    - cell "PPN 11%" [ref=e128]
                    - cell [ref=e129]
                    - cell "Rp 550.000" [ref=e130]
                  - row "Grand Total Rp 5.550.000" [ref=e131]:
                    - cell [ref=e132]
                    - cell [ref=e133]
                    - cell "Grand Total" [ref=e134]
                    - cell [ref=e135]
                    - cell "Rp 5.550.000" [ref=e136]
            - generic [ref=e137]:
              - generic [ref=e138]:
                - generic [ref=e139]: Total Amount
                - generic [ref=e140]: ": Rp 5.000.000"
              - generic [ref=e141]:
                - generic [ref=e142]: Total Discount (%)
                - generic [ref=e143]:
                  - text: ":"
                  - spinbutton [ref=e144]: "0"
                  - generic [ref=e145]: Any value > 0 requires Director review.
              - generic [ref=e146]:
                - generic [ref=e147]: Discount
                - generic [ref=e148]: ": Rp 0"
              - generic [ref=e149]:
                - generic [ref=e150]: Subtotal
                - generic [ref=e151]: ": Rp 5.000.000"
              - generic [ref=e152]:
                - generic [ref=e153]: PPN
                - generic [ref=e154]: ": Rp 550.000"
              - generic [ref=e155]:
                - generic [ref=e156]: Grand Total
                - generic [ref=e157]: ": Rp 5.550.000"
            - generic [ref=e158]:
              - generic [ref=e159]: Notes
              - textbox "Notes" [disabled] [ref=e161]: Setup WO PO
          - generic [ref=e162]:
            - generic [ref=e163]:
              - button "Edit" [ref=e164] [cursor=pointer]
              - button "Print" [ref=e165] [cursor=pointer]
            - button "Create PO" [ref=e167] [cursor=pointer]
    - generic [ref=e170]:
      - img [ref=e172]: 
      - generic [ref=e176]: Failed
      - generic [ref=e177]: No PO is required.
      - button "Close" [ref=e179] [cursor=pointer]
  - generic [ref=e181]:
    - generic "Toggle devtools panel" [ref=e182] [cursor=pointer]:
      - img [ref=e183]
    - generic "Toggle Component Inspector" [ref=e188] [cursor=pointer]:
      - img [ref=e189]
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
  57  |     await page.click('.button-modal button:has-text("Create PO")');
  58  |     
  59  |     const [poResponse] = await Promise.all([
> 60  |       page.waitForResponse(res => res.url().includes('/api/quotation/moveToPo/') && res.status() === 200),
      |            ^ TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
  61  |       page.click('button:has-text("Yes")')
  62  |     ]);
  63  |     
  64  |     let capturedPoId = null;
  65  |     if (poResponse) {
  66  |       const body = await poResponse.json();
  67  |       if (body?.data?.id) capturedPoId = body.data.id;
  68  |     }
  69  | 
  70  |     // Wait for navigation and for API response to be captured
  71  |     await page.waitForURL(/.*purchase-order/, { timeout: 15000 });
  72  |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  73  |     await closeModal(page);
  74  |     servicePoId = capturedPoId;
  75  | 
  76  |     // Logout Marketing and Login as Finance
  77  |     await page.evaluate(() => localStorage.clear());
  78  |     await page.goto('/login');
  79  |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  80  |     await page.fill('input[type="password"]', 'password');
  81  |     await page.click('button[type="submit"]');
  82  |     await page.waitForURL('**/menu', { timeout: 20000 });
  83  | 
  84  |     // Move to PI — navigate directly to the known PO ID (or fallback to list)
  85  |     if (servicePoId) {
  86  |       await page.goto(`/purchase-order/${servicePoId}`);
  87  |     } else {
  88  |       await page.goto('/purchase-order');
  89  |       await page.waitForSelector('.list .item', { timeout: 10000 });
  90  |       await page.locator('.list .item').first().click();
  91  |     }
  92  |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  93  |     await page.click('button:has-text("Create PI")');
  94  |     await page.fill('.modal-body textarea', 'DP 50% for Service');
  95  |     await page.click('.button-modal button:has-text("Create PI")');
  96  |     
  97  |     // Capture PI ID when confirming
  98  |     const [piResponseWo] = await Promise.all([
  99  |       page.waitForResponse(res => res.url().includes('/api/purchase-order/moveToPi/') && res.status() === 200),
  100 |       page.click('button:has-text("Yes")')
  101 |     ]);
  102 |     
  103 |     let capturedWoPiId = null;
  104 |     if (piResponseWo) {
  105 |       const piBodyWo = await piResponseWo.json();
  106 |       if (piBodyWo?.data?.id) capturedWoPiId = piBodyWo.data.id;
  107 |     }
  108 |     await closeModal(page);
  109 | 
  110 |     // Pay DP
  111 |     if (capturedWoPiId) {
  112 |       await page.goto(`/proforma-invoice/${capturedWoPiId}`);
  113 |     } else {
  114 |       await page.goto('/proforma-invoice');
  115 |       await page.waitForSelector('.list .item', { timeout: 10000 });
  116 |       await page.locator('.list .item').first().click();
  117 |     }
  118 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  119 |     
  120 |     // Edit PI to set Down Payment
  121 |     await page.click('button.btn-edit');
  122 |     await page.fill('input[placeholder="Advance Payment"]', '150000');
  123 |     await page.click('button:has-text("Save")');
  124 |     await page.click('button:has-text("Yes")');
  125 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  126 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  127 |     await closeModal(page);
  128 | 
  129 |     await page.click('button:has-text("DP Paid")');
  130 |     await page.click('button:has-text("Yes")');
  131 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  132 |     await closeModal(page);
  133 |     await page.waitForTimeout(2000);
  134 | 
  135 |     // Logout Finance and Login as Director to set Service PO to Ready
  136 |     await page.evaluate(() => localStorage.clear());
  137 |     await page.goto('/login');
  138 |     await page.fill('input[type="email"]', 'director.jkt@bmj.com');
  139 |     await page.fill('input[type="password"]', 'password');
  140 |     await page.click('button[type="submit"]');
  141 |     await page.waitForURL('**/menu', { timeout: 20000 });
  142 | 
  143 |     if (servicePoId) {
  144 |       await page.goto(`/purchase-order/${servicePoId}`);
  145 |     } else {
  146 |       await page.goto('/purchase-order');
  147 |       await page.waitForSelector('.list .item', { timeout: 10000 });
  148 |       await page.locator('.list .item').first().click();
  149 |     }
  150 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  151 |     // Ready button is gated on the PO detail re-fetching its DP-paid status; wait for it
  152 |     // to render rather than clicking immediately (mirrors purchase-order.spec.js PO-API-012).
  153 |     const readyBtn = page.locator('button:has-text("Ready")');
  154 |     await expect(readyBtn).toBeVisible({ timeout: 15000 });
  155 |     await readyBtn.click();
  156 |     await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
  157 |     await page.click('#modalConfirmation button:has-text("Yes")');
  158 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  159 |     await closeModal(page);
  160 |     await page.waitForTimeout(2000);
```