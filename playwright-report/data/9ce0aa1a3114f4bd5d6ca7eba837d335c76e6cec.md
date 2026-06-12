# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quotation.spec.js >> Quotation E2E Tests (Live DB) >> QUOT-API-034: Move to PO from approved quotation
- Location: e2e\quotation.spec.js:146:3

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
                    - textbox "No Quotation" [disabled] [ref=e57]: QUOT/32/BMJ-MEGAH/JKT/3/VI/2026
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
                    - textbox "Company Name" [disabled] [ref=e71]: PT Customer Baru
                  - generic [ref=e72]:
                    - generic [ref=e73]: Address
                    - textbox "Address" [disabled] [ref=e74]: Jl. Test 123
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
                  - row "1 consequuntur blanditiis 5 pcs Rp 1.000 Rp 5.000 available" [ref=e116]:
                    - cell "1" [ref=e117]
                    - cell "consequuntur" [ref=e118]
                    - cell "blanditiis" [ref=e119]
                    - cell "5" [ref=e120]
                    - cell "pcs" [ref=e121]
                    - cell "Rp 1.000" [ref=e122]
                    - cell "Rp 5.000" [ref=e123]
                    - cell "available" [ref=e124]
                  - row "SubTotal Rp 5.000" [ref=e125]:
                    - cell [ref=e126]
                    - cell [ref=e127]
                    - cell "SubTotal" [ref=e128]
                    - cell [ref=e129]
                    - cell [ref=e130]
                    - cell [ref=e131]
                    - cell "Rp 5.000" [ref=e132]
                    - cell [ref=e133]
                  - row "PPN 11% Rp 550" [ref=e134]:
                    - cell [ref=e135]
                    - cell [ref=e136]
                    - cell "PPN 11%" [ref=e137]
                    - cell [ref=e138]
                    - cell [ref=e139]
                    - cell [ref=e140]
                    - cell "Rp 550" [ref=e141]
                    - cell [ref=e142]
                  - row "Grand Total Rp 5.550" [ref=e143]:
                    - cell [ref=e144]
                    - cell [ref=e145]
                    - cell "Grand Total" [ref=e146]
                    - cell [ref=e147]
                    - cell [ref=e148]
                    - cell [ref=e149]
                    - cell "Rp 5.550" [ref=e150]
                    - cell [ref=e151]
            - generic [ref=e152]:
              - generic [ref=e153]:
                - generic [ref=e154]: Total Amount
                - generic [ref=e155]: ": Rp 5.000"
              - generic [ref=e156]:
                - generic [ref=e157]: Total Discount (%)
                - generic [ref=e158]:
                  - text: ":"
                  - spinbutton [ref=e159]: "0"
                  - generic [ref=e160]: Any value > 0 requires Director review.
              - generic [ref=e161]:
                - generic [ref=e162]: Discount
                - generic [ref=e163]: ": Rp 57.658.167"
              - generic [ref=e164]:
                - generic [ref=e165]: Subtotal
                - generic [ref=e166]: ": Rp 5.000"
              - generic [ref=e167]:
                - generic [ref=e168]: PPN
                - generic [ref=e169]: ": Rp 550"
              - generic [ref=e170]:
                - generic [ref=e171]: Grand Total
                - generic [ref=e172]: ": Rp 5.550"
            - generic [ref=e173]:
              - generic [ref=e174]: Notes
              - textbox "Notes" [disabled] [ref=e176]: Test quotation notes
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
  90  |     try {
  91  |       await expect(page.locator('.list .item').first()).toBeVisible({ timeout: 15000 });
  92  |     } catch (e) {
  93  |       console.log('HTML DUMP:');
  94  |       console.log(await page.content());
  95  |       throw e;
  96  |     }
  97  |   });
  98  | 
  99  |   test('QUOT-API-028: Director approves quotation', async ({ page }) => {
  100 |     // Logout marketing user
  101 |     await page.goto('/profile');
  102 |     const profileNav = page.locator('.profilePP .nav-link');
  103 |     await expect(profileNav).toBeVisible({ timeout: 15000 });
  104 |     await profileNav.click();
  105 |     await page.click('.logout-btn');
  106 |     await page.waitForURL('**/login', { timeout: 20000 });
  107 | 
  108 |     // Login as Director (from EmployeeSeeder.php)
  109 |     await page.fill('input[type="email"]', 'director.jkt@bmj.com');
  110 |     await page.fill('input[type="password"]', 'password');
  111 |     await page.click('button[type="submit"]');
  112 |     await page.waitForURL('**/menu', { timeout: 20000 });
  113 | 
  114 |     // Go to Quotation Review page
  115 |     await page.goto('/quotation/review');
  116 |     
  117 |     // Check if there's a quotation to review (created by previous test)
  118 |     // Since seeders also create quotations on review, there should be items here
  119 |     
  120 |     // Click on the first Detail button
  121 |     try {
  122 |       await expect(page.locator('.list .item').first()).toBeVisible({ timeout: 15000 });
  123 |       await page.locator('.list .item').first().click();
  124 |     } catch (e) {
  125 |       console.log('REVIEW PAGE HTML DUMP:');
  126 |       console.log(await page.content());
  127 |       throw e;
  128 |     }
  129 |     
  130 |     // Wait for detail page
  131 |     await page.waitForURL('**/quotation/review/*');
  132 | 
  133 |     // Click Approve
  134 |     await page.click('button:has-text("Approve")');
  135 |     
  136 |     // Confirm approval
  137 |     await page.click('button:has-text("Yes")');
  138 |     
  139 |     // Wait for success modal and close it
  140 |     await closeModal(page);
  141 |     
  142 |     // Manually navigate back to review list (UI doesn't auto-redirect)
  143 |     await page.goto('/quotation/review');
  144 |   });
  145 | 
  146 |   test('QUOT-API-034: Move to PO from approved quotation', async ({ page }) => {
  147 |     // Continue as Director (from previous test)
  148 |     // Go to Quotation list
  149 |     await page.goto('/quotation');
  150 |     // Clear any leftover success/error modal from the prior serial test — a lingering
  151 |     // #modalMessage overlay would intercept the list-item click below. Short appear-wait
  152 |     // since we're only clearing a pre-existing modal, not waiting for a new one.
  153 |     await closeModal(page, { waitForAppear: 800 });
  154 | 
  155 |     // Wait for data to load
  156 |     await expect(page.locator('.list .item').first()).toBeVisible();
  157 | 
  158 |     // Target an APPROVED quotation. If none is in the list yet (the review-approve in the
  159 |     // prior test can land on a seeded review item rather than ours), approve one first so
  160 |     // this test is self-sufficient instead of depending on cross-test ordering.
  161 |     let approvedRow = page.locator('.list .item', { hasText: 'Approved' }).first();
  162 |     if (!(await approvedRow.isVisible().catch(() => false))) {
  163 |       // Approve the first reviewable quotation via the review flow, then come back.
  164 |       await page.goto('/quotation/review');
  165 |       await closeModal(page);
  166 |       await expect(page.locator('.list .item').first()).toBeVisible({ timeout: 15000 });
  167 |       await page.locator('.list .item').first().click();
  168 |       await page.waitForURL('**/quotation/review/*');
  169 |       await page.click('button:has-text("Approve")');
  170 |       await page.click('button:has-text("Yes")');
  171 |       await closeModal(page);
  172 |       await page.goto('/quotation');
  173 |       await closeModal(page);
  174 |       approvedRow = page.locator('.list .item', { hasText: 'Approved' }).first();
  175 |     }
  176 |     await expect(approvedRow).toBeVisible({ timeout: 15000 });
  177 |     await approvedRow.click();
  178 | 
  179 |     // Wait for detail page
  180 |     await page.waitForURL('**/quotation/*');
  181 | 
  182 |     // Click 'Create PO'
  183 |     await page.click('button:has-text("Create PO")');
  184 |     
  185 |     // Notes modal appears
  186 |     await page.fill('.modal-body textarea', 'Test Move to PO');
  187 |     await page.click('.button-modal button:has-text("Create PO")');
  188 |     
  189 |     // Confirmation modal appears
> 190 |     await page.click('button:has-text("Yes")');
      |                ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  191 |     
  192 |     // Wait for redirect to purchase order list
  193 |     await page.waitForURL('**/purchase-order', { timeout: 10000 });
  194 |     
  195 |     // Close success modal
  196 |     await closeModal(page);
  197 |     
  198 |     // Verify it's in the list
  199 |     await expect(page.locator('.list .item').first()).toBeVisible();
  200 |   });
  201 | 
  202 |   test('QUOT-API-030 & QUOT-API-032: Reject quotation', async ({ page }) => {
  203 |     // Multi-step flow with logout/login + create + Director reject — the 30s default is too
  204 |     // tight under UI-Mode load.
  205 |     test.setTimeout(90000);
  206 |     // Logout Director
  207 |     await page.goto('/profile');
  208 |     const profileNav = page.locator('.profilePP .nav-link');
  209 |     await expect(profileNav).toBeVisible({ timeout: 15000 });
  210 |     await profileNav.click();
  211 |     await page.click('.logout-btn');
  212 |     await page.waitForURL('**/login', { timeout: 20000 });
  213 | 
  214 |     // Login as Marketing
  215 |     await page.fill('input[type="email"]', 'citra.k@bmj.com');
  216 |     await page.fill('input[type="password"]', 'password');
  217 |     await page.click('button[type="submit"]');
  218 |     await page.waitForURL('**/menu', { timeout: 20000 });
  219 | 
  220 |     // Create a new quotation that needs review (low price)
  221 |     await page.goto('/quotation/add');
  222 |     await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
  223 |     
  224 |     // Fill Customer Manually
  225 |     await page.fill('input[placeholder="Company Name"]', 'PT Customer Rejection');
  226 |     await page.fill('input[placeholder="Address"]', 'Jl. Tolak 123');
  227 |     await page.fill('input[placeholder="City"]', 'Jakarta');
  228 |     await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
  229 |     await page.fill('input[placeholder="Office"]', '021-123456');
  230 |     await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
  231 |     await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
  232 |     await page.fill('input[placeholder="Postal Code"]', '12345');
  233 |     
  234 |     // Fill notes to satisfy Laravel 'sometimes|string' validation which fails on null
  235 |     await page.fill('textarea[placeholder="Notes"]', 'Test quotation notes');
  236 |     
  237 |     // Select Sparepart
  238 |     await page.click('button:has-text("Add Sparepart")');
  239 |     const firstRow = page.locator('.sparepart .list').first();
  240 |     const searchPromise = page.waitForResponse(resp => resp.url().includes('/api/sparepart') && resp.status() === 200);
  241 |     await firstRow.locator('input[placeholder="Part Name"]').pressSequentially('e', { delay: 100 });
  242 |     await searchPromise;
  243 |     await expect(firstRow.locator('.dropdown-item').first()).toBeVisible({ timeout: 10000 });
  244 |     await firstRow.locator('.dropdown-item').first().click();
  245 |     await firstRow.locator('input[placeholder="Quantity"]').fill('1');
  246 |     
  247 |     // Use a very low price to ensure it needs review
  248 |     await firstRow.locator('input[placeholder="Unit Price"]').fill('100');
  249 |     await firstRow.locator('input[placeholder="Unit Price"]').blur();
  250 |     
  251 |     await page.click('button.btn-process:has-text("Add Quotation")');
  252 |     await page.click('button:has-text("Yes")');
  253 |     await page.waitForURL('**/quotation', { timeout: 10000 });
  254 | 
  255 |     // Logout Marketing
  256 |     await page.goto('/profile');
  257 |     const profileNav2 = page.locator('.profilePP .nav-link');
  258 |     await expect(profileNav2).toBeVisible({ timeout: 15000 });
  259 |     await profileNav2.click();
  260 |     await page.click('.logout-btn');
  261 |     await page.waitForURL('**/login', { timeout: 20000 });
  262 | 
  263 |     // Login as Director
  264 |     await page.fill('input[type="email"]', 'director.jkt@bmj.com');
  265 |     await page.fill('input[type="password"]', 'password');
  266 |     await page.click('button[type="submit"]');
  267 |     await page.waitForURL('**/menu', { timeout: 20000 });
  268 | 
  269 |     // Go to Quotation Review page
  270 |     await page.goto('/quotation/review');
  271 |     
  272 |     // Click on the first Detail button
  273 |     await page.locator('.list .item').first().click();
  274 |     await page.waitForURL('**/quotation/review/*');
  275 | 
  276 |     // Click Reject
  277 |     await page.click('button:has-text("Reject")');
  278 |     
  279 |     // Confirmation modal appears
  280 |     await page.click('button:has-text("Yes")');
  281 |     
  282 |     // Wait for success modal and close it
  283 |     await closeModal(page);
  284 |     
  285 |     // Manually navigate back to review list
  286 |     await page.goto('/quotation/review');
  287 |   });
  288 | });
  289 | 
```