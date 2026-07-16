const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Login
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'director.jkt@bmj.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/menu', { timeout: 10000 });
  
  // Create Quotation
  page.on('response', resp => {
    if (resp.url().includes('/api/quotation') && resp.request().method() === 'POST') {
      console.log('Quotation POST status:', resp.status());
      resp.text().then(t => console.log('Response:', t)).catch(e => console.error(e));
    }
  });

  await page.goto('http://localhost:5173/quotation/add');
  await page.selectOption('select[aria-label="Project Type"]', 'Service');
  await page.selectOption('select[aria-label="Branch"]', 'Jakarta');
  await page.fill('input[placeholder="Company Name"]', 'PT WO Test');
  await page.fill('input[placeholder="Address"]', 'Jl. WO');
  await page.fill('input[placeholder="City"]', 'Jakarta');
  await page.fill('input[placeholder="Province"]', 'DKI Jakarta');
  await page.fill('input[placeholder="Office"]', '021-123456');
  await page.fill('input[placeholder="Urban"]', 'Kelurahan Test');
  await page.fill('input[placeholder="Subdistrict"]', 'Kecamatan Test');
  await page.fill('input[placeholder="Postal Code"]', '12345');
  await page.fill('input[placeholder="NPWP"]', '123456789');
  await page.fill('input[placeholder="Email"]', 'test@test.com');
  await page.fill('textarea[placeholder="Notes"]', 'Setup WO PO');

  await page.click('button:has-text("Add Service")');
  const firstRow = page.locator('.add-service .list.row').first();
  await firstRow.locator('input[placeholder="Service Name"]').fill('E2E Engine Repair');
  await firstRow.locator('input[placeholder="Quantity"]').fill('1');
  await firstRow.locator('input[placeholder="Unit Price"]').fill('5000000');
  // Trigger blur to compute totals
  await firstRow.locator('input[placeholder="Quantity"]').blur();
  
  await page.click('button.btn-process:has-text("Add Quotation")');
  await page.click('button:has-text("Yes")');
  
  // Wait a bit to see the API call
  await page.waitForTimeout(3000);
  await browser.close();
})();
