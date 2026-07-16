const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

// 1. Emails
c = c.replace(/citra\.k@bmj\.com/g, 'marketing.jkt@bmj.com');
c = c.replace(/hadi\.s@bmj\.com/g, 'service.jkt@bmj.com');
c = c.replace(/eko\.p@bmj\.com/g, 'inventory.admin.jkt@bmj.com');
c = c.replace(/fajar\.n@bmj\.com/g, 'finance.jkt@bmj.com');

// 2. Customer Form NPWP/Email/Branch
const targetForm = `    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('textarea[placeholder="Notes"]', 'Setup WO PO');`;
const replacementForm = `    await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('input[placeholder="NPWP"]', '01.234.567.8-901.234');
    await page.fill('input[placeholder="Email"]', 'client@test.com');
    await page.selectOption('select[aria-label="Branch"]', { label: 'Jakarta' });
    await page.fill('textarea[placeholder="Notes"]', 'Setup WO PO');`;
c = c.replace(targetForm, replacementForm);

// 3. Login intercept (First login)
const loginRegex1 = /await page\.click\('button\[type="submit"\]'\);\s*await page\.waitForURL\('\*\*\/menu', \{ timeout: 20000 \}\);/;
const loginIntercept1 = `const responsePromise = page.waitForResponse(response => response.url().includes('/api/login'));
    await page.click('button[type="submit"]');
    const response = await responsePromise;
    console.log('Login Request Body:', await response.request().postData());
    console.log('Login Status:', response.status());
    if (response.status() !== 200) {
      console.log('Login Failed body:', await response.json());
    }
    await page.waitForURL('**/menu', { timeout: 20000 });`;
c = c.replace(loginRegex1, loginIntercept1);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('All patches applied correctly!');
