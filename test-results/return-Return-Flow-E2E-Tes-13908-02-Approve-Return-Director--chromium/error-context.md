# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: return.spec.js >> Return Flow E2E Tests (Live DB) >> RET-API-002: Approve Return (Director)
- Location: e2e\return.spec.js:138:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.list .item').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.list .item').first()

```

```yaml
- navigation:
  - link "PT. BMJ":
    - /url: /menu
  - text:  Director
  - link " Dashboard":
    - /url: /dashboard
  - link " Quotation":
    - /url: /quotation
  - link " Purchase Order":
    - /url: /purchase-order
  - link " Proforma Invoice":
    - /url: /proforma-invoice
  - link " Invoice":
    - /url: /invoice
  - text:  Spareparts 
  - link " Back Order":
    - /url: /back-order
  - link " Purchase":
    - /url: /purchase
  - link " Employee":
    - /url: /employee
  - link " Work Order":
    - /url: /work-order
  - link " Delivery Order":
    - /url: /delivery-order
  - link " General":
    - /url: /general
  - link " Upload Data":
    - /url: /upload-data
- text: Return Hello, Budi
- link:
  - /url: "#"
  - img: 
- textbox "Search"
- button ""
- combobox:
  - option "january"
  - option "february"
  - option "march"
  - option "april"
  - option "may"
  - option "june" [selected]
  - option "july"
  - option "august"
  - option "september"
  - option "october"
  - option "november"
  - option "december"
- combobox:
  - option "2020"
  - option "2021"
  - option "2022"
  - option "2023"
  - option "2024"
  - option "2025"
  - option "2026" [selected]
- text: Loading...
- navigation "page navigation":
  - list:
    - listitem:
      - link "Previous":
        - /url: "#"
    - listitem:
      - link "1":
        - /url: "#"
    - listitem:
      - link "Next":
        - /url: "#"
- img
- img
```

# Test source

```ts
  52  |           province: 'DKI Jakarta',
  53  |           postalCode: '12345',
  54  |           office: '021-123456',
  55  |           urban: 'Kelurahan Test',
  56  |           subdistrict: 'Kecamatan Test',
  57  |         },
  58  |         price: { amount: 50000 },
  59  |         spareparts: [{ sparepartId, quantity: 1, unitPriceSell: 50000 }]
  60  |       }
  61  |     });
  62  |     let body = await res.json();
  63  |     expect(res.status()).toBe(201);
  64  |     const quotSlug = body.data.slug;
  65  | 
  66  |     // 2. Approve Quotation
  67  |     await apiContext.post(`/api/quotation/approve/${quotSlug}`, { data: { notes: 'Approved for return test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  68  | 
  69  |     // 3. Move to PO
  70  |     res = await apiContext.post(`/api/quotation/moveToPo/${quotSlug}`, { data: { notes: 'Move to PO for return test', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  71  |     body = await res.json();
  72  |     expect(res.status()).toBe(200);
  73  |     poId = body.data.id;
  74  | 
  75  |     // 4. Move to PI
  76  |     res = await apiContext.post(`/api/purchase-order/moveToPi/${poId}`, { data: { notes: 'Create PI for return', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  77  |     expect(res.status()).toBe(200);
  78  | 
  79  |     // 5. Set Ready
  80  |     res = await apiContext.post(`/api/purchase-order/ready/${poId}`, { data: { notes: 'Ready', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  81  |     expect(res.status()).toBe(200);
  82  | 
  83  |     // 6. Release DO (Requires deliveryOrder payload)
  84  |     res = await apiContext.post(`/api/purchase-order/release/${poId}`, { 
  85  |       data: { 
  86  |         deliveryOrder: {
  87  |           deliveryOrderDate: '2026-06-06',
  88  |           pickedBy: 'Courier',
  89  |           shipMode: 'Land',
  90  |           orderType: 'Normal'
  91  |         },
  92  |         notes: 'Release DO' 
  93  |       } 
  94  |     });
  95  |     expect(res.status()).toBe(200);
  96  | 
  97  |     // 7. Mark Done (Marketing role in UI or Director via API)
  98  |     res = await apiContext.post(`/api/purchase-order/done/${poId}`, { data: { notes: 'Done', poNumber: `PO-${Date.now()}-${Math.floor(Math.random()*1000)}` } });
  99  |     expect(res.status()).toBe(200);
  100 | 
  101 |     // 8. Now use UI (Marketing) to click Return
  102 |     await page.goto('/login');
  103 |     await page.fill('input[type="email"]', 'director.jkt@bmj.com');
  104 |     await page.fill('input[type="password"]', 'password');
  105 |     await page.click('button[type="submit"]');
  106 |     await page.waitForURL('**/menu', { timeout: 20000 });
  107 | 
  108 |     await page.goto(`/purchase-order/${poId}`);
  109 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  110 | 
  111 |     // Debug: fetch PO to see status array
  112 |     const poRes = await apiContext.get(`/api/purchase-order/${poId}`);
  113 |     const poBody = await poRes.json();
  114 |     console.log("PO Detail in RET-SETUP:", JSON.stringify(poBody.data?.status));
  115 | 
  116 |     const returnBtn = page.locator('button:has-text("Return")');
  117 |     await expect(returnBtn).toBeVisible({ timeout: 10000 });
  118 |     await returnBtn.click();
  119 | 
  120 |     await page.waitForURL(/.*return/, { timeout: 10000 });
  121 | 
  122 |     // Check return items and click submit
  123 |     const listRow = page.locator('.add-sparepart .list.row').first();
  124 |     await listRow.locator('.col-3 input[type="number"]').fill('1');
  125 |     await listRow.locator('button.btn-outline-dark').click();
  126 | 
  127 |     const submitBtn = page.locator('button:has-text("Return")').last();
  128 |     await expect(submitBtn).toBeVisible({ timeout: 10000 });
  129 |     await submitBtn.click();
  130 |     await expect(page.locator('#modalConfirmation')).toBeVisible({ timeout: 10000 });
  131 |     await page.click('#modalConfirmation button:has-text("Yes")');
  132 |     await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  133 |     await closeModal(page);
  134 | 
  135 |     await page.screenshot({ path: 'e2e/screenshots/return-quotation.png', fullPage: true });
  136 |   });
  137 | 
  138 |   test('RET-API-002: Approve Return (Director)', async () => {
  139 |     // Login as Director
  140 |     await page.evaluate(() => localStorage.clear());
  141 |     await page.goto('/login');
  142 |     await page.fill('input[type="email"]', 'director.jkt@bmj.com');
  143 |     await page.fill('input[type="password"]', 'password');
  144 |     await page.click('button[type="submit"]');
  145 |     await page.waitForURL('**/menu', { timeout: 20000 });
  146 | 
  147 |     // Navigate to Return Page
  148 |     await page.goto('/return');
  149 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  150 | 
  151 |     // Check list
> 152 |     await expect(page.locator('.list .item').first()).toBeVisible({ timeout: 10000 });
      |                                                       ^ Error: expect(locator).toBeVisible() failed
  153 |     await page.locator('.list .item').first().click();
  154 | 
  155 |     // Approve Return
  156 |     const approveReturnBtn = page.locator('button:has-text("Approve Return")');
  157 |     if (await approveReturnBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  158 |       await approveReturnBtn.click();
  159 |       await page.fill('.modal-body textarea', 'Approved return').catch(() => {});
  160 |       await page.click('.button-modal button:has-text("Approve Return")').catch(() => {});
  161 |       await page.click('button:has-text("Yes")');
  162 |       await expect(page.locator('#modalMessage .text-header')).toHaveText(/successfully|success/i, { timeout: 10000 });
  163 |       await closeModal(page);
  164 |     }
  165 | 
  166 |     await page.screenshot({ path: 'e2e/screenshots/return-approve.png', fullPage: true });
  167 |   });
  168 | });
  169 | 
```