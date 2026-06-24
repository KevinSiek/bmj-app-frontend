const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const screenshotDir = path.join(__dirname, 'playwright-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

const ACCOUNTS = {
  director:         { email: 'director.jkt@bmj.com', password: 'password', menuUrl: '/menu/director' },
  marketing:        { email: 'citra.k@bmj.com', password: 'password', menuUrl: '/menu/marketing' },
  finance:          { email: 'fajar.n@bmj.com', password: 'password', menuUrl: '/menu/finance' },
  inventoryAdmin:   { email: 'eko.p@bmj.com', password: 'password', menuUrl: '/menu/inventory-admin' },
  inventoryPurchase:{ email: 'indah.s@bmj.com', password: 'password', menuUrl: '/menu/inventory-purchase' },
  headInventory:    { email: 'headinv.jkt@bmj.com', password: 'password', menuUrl: '/menu/inventory-head' },
  service:          { email: 'hadi.s@bmj.com', password: 'password', menuUrl: '/menu/service' },
};

async function captureForRole(browser, roleName, account, targets) {
  console.log(`\n--- Capturing for role: ${roleName} ---`);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Log in
  console.log(`Logging in as ${account.email}...`);
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', account.email);
  await page.fill('input[type="password"]', account.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/menu*', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Capture Dashboard/Menu
  console.log(`Capturing dashboard...`);
  const menuPath = path.join(screenshotDir, `${roleName}-dashboard.png`);
  await page.screenshot({ path: menuPath });
  console.log(`Captured: ${menuPath}`);

  // Capture targets
  for (const target of targets) {
    try {
      console.log(`Navigating to ${target.url}...`);
      await page.goto(`http://localhost:5173${target.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500); // Wait for animations or dynamic content

      const filePath = path.join(screenshotDir, `${roleName}-${target.name}.png`);
      await page.screenshot({ path: filePath });
      console.log(`Captured: ${filePath}`);
    } catch (err) {
      console.error(`Failed to capture ${target.url} for ${roleName}:`, err.message);
    }
  }

  await context.close();
}

(async () => {
  const browser = await chromium.launch();
  try {
    // 1. Generic Login Page (anonymous context)
    console.log('Capturing generic login page...');
    const loginContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const loginPage = await loginContext.newPage();
    await loginPage.goto('http://localhost:5173/login');
    await loginPage.waitForLoadState('networkidle');
    await loginPage.screenshot({ path: path.join(screenshotDir, 'login-page.png') });
    await loginContext.close();

    // 2. Marketing Role Page Targets
    await captureForRole(browser, 'marketing', ACCOUNTS.marketing, [
      { name: 'quotation-list', url: '/quotation' },
      { name: 'quotation-add', url: '/quotation/add' },
      { name: 'borrow-list', url: '/borrow' },
      { name: 'borrow-add', url: '/borrow/add' }
    ]);

    // 3. Finance Role Page Targets
    await captureForRole(browser, 'finance', ACCOUNTS.finance, [
      { name: 'po-list', url: '/purchase-order' },
      { name: 'pi-list', url: '/proforma-invoice' },
      { name: 'invoice-list', url: '/invoice' }
    ]);

    // 4. Inventory Admin Role Page Targets
    await captureForRole(browser, 'inventoryAdmin', ACCOUNTS.inventoryAdmin, [
      { name: 'do-list', url: '/delivery-order' },
      { name: 'movement-list', url: '/sparepart-movement' },
      { name: 'stock-history', url: '/stock-history' }
    ]);

    // 5. Inventory Purchase Role Page Targets
    await captureForRole(browser, 'inventoryPurchase', ACCOUNTS.inventoryPurchase, [
      { name: 'purchase-list', url: '/purchase' },
      { name: 'purchase-add', url: '/purchase/add' }
    ]);

    // 6. Service Role Page Targets
    await captureForRole(browser, 'service', ACCOUNTS.service, [
      { name: 'work-order-list', url: '/work-order' }
    ]);

    // 7. Director Role Page Targets
    await captureForRole(browser, 'director', ACCOUNTS.director, [
      { name: 'dashboard-analytics', url: '/dashboard' },
      { name: 'employee-list', url: '/employee' },
      { name: 'general-settings', url: '/general' }
    ]);

    console.log('\nAll screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshots execution:', err);
  } finally {
    await browser.close();
  }
})();
