# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: purchase-order-negative.spec.js >> Purchase Order Decline & Negative Flow >> PO-API-023: Decline PO — Finance role
- Location: e2e\purchase-order-negative.spec.js:91:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Reject PO")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button:has-text("Reject PO")')

```

```yaml
- img
- img
```

# Test source

```ts
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
  67  |     await page.fill('.modal-body input[type="text"]', `PO-${Date.now()}-${Math.floor(Math.random()*1000)}`);
  68  |     await page.click('.button-modal button:has-text("Create PO")');
  69  |     await page.click('button:has-text("Yes")');
  70  |     
  71  |     const response = await responsePromise;
  72  |     const json = await response.json();
  73  |     poId = json.data.id;
  74  |     
  75  |     await expect(page).toHaveURL(/.*purchase-order/, { timeout: 20000 });
  76  |     await closeModal(page);
  77  |     await page.screenshot({ path: 'e2e/screenshots/po-decline-setup.png', fullPage: true });
  78  |   });
  79  | 
  80  |   test('PO-API-025: Decline PO — Marketing role blocked (UI Button Missing)', async () => {
  81  |     // Marketing is already logged in
  82  |     await page.goto('/purchase-order');
  83  |     await page.locator('.list .item').first().click();
  84  |     
  85  |     // The "Reject PO" button should not be visible for Marketing
  86  |     const rejectBtn = page.locator('button:has-text("Reject PO")');
  87  |     await expect(rejectBtn).not.toBeVisible();
  88  |     await page.screenshot({ path: 'e2e/screenshots/po-api-025-marketing-blocked.png', fullPage: true });
  89  |   });
  90  | 
  91  |   test('PO-API-023: Decline PO — Finance role', async () => {
  92  |     // Login as Finance
  93  |     await page.evaluate(() => localStorage.clear());
  94  |     await page.goto('/login');
  95  |     await page.fill('input[type="email"]', 'fajar.n@bmj.com');
  96  |     await page.fill('input[type="password"]', 'password');
  97  |     await page.click('button[type="submit"]');
  98  |     await page.waitForURL('**/menu', { timeout: 20000 });
  99  | 
  100 |     // Navigate to PO
  101 |     await page.goto(`/purchase-order/${poId}`);
  102 |     
  103 |     const rejectBtn = page.locator('button:has-text("Reject PO")');
  104 |     // Finance should be able to see and click Reject PO based on the test case
> 105 |     await expect(rejectBtn).toBeVisible();
      |                             ^ Error: expect(locator).toBeVisible() failed
  106 |     await rejectBtn.click();
  107 |     
  108 |     // Test validation: notes required (PO-API-026 implicitly via UI if applicable)
  109 |     // For now, let's just reject it
  110 |     await page.fill('.modal-body textarea', 'Budget exceeded');
  111 |     
  112 |     const rejectResponsePromise = page.waitForResponse(response => 
  113 |       response.url().includes('/reject/') && response.request().method() === 'POST'
  114 |     );
  115 |     
  116 |     await page.click('.button-modal button:has-text("Reject")');
  117 |     await page.click('button:has-text("Yes")');
  118 |     
  119 |     const rejectResponse = await rejectResponsePromise;
  120 |     console.log(`Reject API Status: ${rejectResponse.status()}`);
  121 |     console.log(`Reject API Body:`, await rejectResponse.json());
  122 |     
  123 |     // Check success
  124 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  125 |     
  126 |     // Check status is rejected in the list
  127 |     await page.goto(`/purchase-order`);
  128 |     await expect(page.locator('.list .item .content').first()).toContainText('Rejected', { ignoreCase: true });
  129 |     await page.screenshot({ path: 'e2e/screenshots/po-api-023-decline-success.png', fullPage: true });
  130 |   });
  131 | });
  132 | 
```