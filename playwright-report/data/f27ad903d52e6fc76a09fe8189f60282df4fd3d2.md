# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: purchase-order.spec.js >> Purchase Order E2E Tests (Live DB) >> PO-API-008: Move to PI (Finance)
- Location: e2e\purchase-order.spec.js:112:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Create PI")')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('button:has-text("Create PI")')

```

```yaml
- navigation:
  - link "PT. BMJ":
    - /url: /menu
  - text:  Finance
  - link " Quotation":
    - /url: /quotation
  - link " Purchase Order":
    - /url: /purchase-order
  - link " Proforma Invoice":
    - /url: /proforma-invoice
  - link " Invoice":
    - /url: /invoice
- text:  Detail PO
- button "Track"
- text: Hello, Fajar
- link:
  - /url: "#"
  - img: 
- img
- img
```

# Test source

```ts
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
  77  |     await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
  78  |     await page.click('.button-modal button:has-text("Create PO")');
  79  |     // Await the moveToPo API response so the assertion doesn't race the navigation.
  80  |     await Promise.all([
  81  |       page.waitForResponse((r) => r.url().includes('/api/quotation/moveToPo/') && r.status() === 200, { timeout: 20000 }),
  82  |       page.click('button:has-text("Yes")'),
  83  |     ]);
  84  |     await expect(page).toHaveURL(/.*purchase-order/, { timeout: 20000 });
  85  |     await closeModal(page);
  86  | 
  87  |     // Extract PO number for later tests
  88  |     const poRow = page.locator('.list .item').first();
  89  |     await expect(poRow).toBeVisible();
  90  |     await page.screenshot({ path: 'e2e/screenshots/po-setup-success.png', fullPage: true });
  91  |   });
  92  | 
  93  |   test('UI-PO-031: PO detail page shows Track timeline', async () => {
  94  |     // We are still logged in as Director from the setup test!
  95  |     await page.goto('/purchase-order');
  96  |     
  97  |     // Click on the created PO
  98  |     await page.locator('.list .item').first().click();
  99  |     
  100 |     // Click Track button in the top navbar
  101 |     await page.click('.page-title .track .btn');
  102 |     
  103 |     // Verify track component is visible
  104 |     await expect(page.locator('.popup')).toBeVisible();
  105 |     await expect(page.locator('.popup .step').first()).toBeVisible();
  106 |     
  107 |     // Close the track modal/offcanvas
  108 |     await page.locator('.popup .bi-x').click();
  109 |     await page.screenshot({ path: 'e2e/screenshots/po-ui-track-modal.png', fullPage: true });
  110 |   });
  111 | 
  112 |   test('PO-API-008: Move to PI (Finance)', async () => {
  113 |     // Logout Marketing and Login as Finance
  114 |     await page.evaluate(() => localStorage.clear());
  115 |     await page.goto('/login');
  116 |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  117 |     await page.fill('input[type="password"]', 'password');
  118 |     await page.click('button[type="submit"]');
  119 |     await page.waitForURL('**/menu', { timeout: 20000 });
  120 | 
  121 |     // Navigate to PO detail
  122 |     await page.goto('/purchase-order');
  123 |     await closeModal(page, { waitForAppear: 800 }); // clear any leftover modal before clicking
  124 |     await page.locator('.list .item').first().click();
  125 | 
  126 |     // Click 'Create PI'
  127 |     const createPiBtn = page.locator('button:has-text("Create PI")');
> 128 |     await expect(createPiBtn).toBeVisible({ timeout: 15000 });
      |                               ^ Error: expect(locator).toBeVisible() failed
  129 |     await createPiBtn.click();
  130 | 
  131 |     // Fill notes and confirm
  132 |     await page.fill('.modal-body textarea', 'DP 50% for PI');
  133 |     await page.click('.button-modal button:has-text("Create PI")');
  134 |     // Await the moveToPi API response so the URL assertion doesn't race the navigation
  135 |     // (the default 5s toHaveURL is too tight under UI-Mode load).
  136 |     await Promise.all([
  137 |       page.waitForResponse((r) => r.url().includes('/api/purchase-order/moveToPi/') && r.status() === 200, { timeout: 20000 }),
  138 |       page.click('button:has-text("Yes")'),
  139 |     ]);
  140 | 
  141 |     // Should navigate to Proforma Invoice page
  142 |     await expect(page).toHaveURL(/.*proforma-invoice/, { timeout: 20000 });
  143 |     await closeModal(page);
  144 |     
  145 |     // Verify it is now in the PI list
  146 |     await expect(page.locator('.list .item').first()).toBeVisible();
  147 | 
  148 |     // Click the PI to open detail
  149 |     await page.locator('.list .item').first().click();
  150 |     
  151 |     // Click DP Paid
  152 |     const dpPaidBtn = page.locator('button:has-text("DP Paid")');
  153 |     await expect(dpPaidBtn).toBeVisible({ timeout: 15000 });
  154 |     await dpPaidBtn.click();
  155 |     
  156 |     // Confirm
  157 |     await page.click('button:has-text("Yes")');
  158 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  159 |     await page.screenshot({ path: 'e2e/screenshots/po-api-008-move-to-pi.png', fullPage: true });
  160 |   });
  161 | 
  162 |   test('PO-API-012: Set to Ready (Inventory Admin)', async () => {
  163 |     // Login as Inventory Admin
  164 |     await page.evaluate(() => localStorage.clear());
  165 |     await page.goto('/login');
  166 |     await page.fill('input[type="email"]', 'eko.p@bmj.com');
  167 |     await page.fill('input[type="password"]', 'password');
  168 |     await page.click('button[type="submit"]');
  169 |     await page.waitForURL('**/menu', { timeout: 20000 });
  170 | 
  171 |     // Navigate to PO detail
  172 |     await page.goto('/purchase-order');
  173 |     await page.locator('.list .item').first().click();
  174 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  175 |     
  176 |     // Click 'Ready'
  177 |     const readyBtn = page.locator('button:has-text("Ready")');
  178 |     await expect(readyBtn).toBeVisible({ timeout: 15000 });
  179 |     await readyBtn.click();
  180 |     
  181 |     // Wait for confirmation modal then confirm
  182 |     await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
  183 |     await page.click('#modalConfirmation button:has-text("Yes")');
  184 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  185 |     
  186 |     // Close success modal
  187 |     await closeModal(page);
  188 |     await page.waitForTimeout(1500);
  189 |     
  190 |     await page.screenshot({ path: 'e2e/screenshots/po-api-012-ready.png', fullPage: true });
  191 |   });
  192 | 
  193 |   test('PO-API-019: Release Spareparts PO (Inventory Admin)', async () => {
  194 |     // We are still logged in as Inventory Admin on the PO detail page
  195 |     
  196 |     // Click 'Release'
  197 |     const releaseBtn = page.locator('button:has-text("Release")');
  198 |     await expect(releaseBtn).toBeVisible({ timeout: 15000 });
  199 |     await releaseBtn.click();
  200 |     
  201 |     // Should navigate to DO Add page
  202 |     await expect(page).toHaveURL(/.*delivery-order\/add/, { timeout: 20000 });
  203 |     
  204 |     // Fill release modal (Delivery Order form for Spareparts PO)
  205 |     await page.fill('input[type="date"]', '2026-06-03');
  206 |     await page.fill('input[placeholder="Received by"]', 'John Doe');
  207 |     await page.fill('input[placeholder="Picked by"]', 'Jane Smith');
  208 |     await page.fill('input[placeholder="Ship Mode"]', 'Land');
  209 |     await page.fill('input[placeholder="Order Type"]', 'Regular');
  210 |     
  211 |     // Click Release on DO form
  212 |     await page.click('.button .btn-process');
  213 |     
  214 |     // Confirm
  215 |     await page.click('button:has-text("Yes")');
  216 |     
  217 |     // Verify success and Wait for API success
  218 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  219 |     
  220 |     // Close success modal
  221 |     await closeModal(page);
  222 |     await expect(page).toHaveURL(/.*delivery-order.*/, { timeout: 20000 });
  223 |     await page.screenshot({ path: 'e2e/screenshots/po-api-019-release-do.png', fullPage: true });
  224 |   });
  225 | 
  226 |   test('PO-API-020: Release blocked if DO exists & Role UI visibility', async () => {
  227 |     // Navigate back to the PO detail
  228 |     await page.goto('/purchase-order');
```