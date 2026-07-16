import fs from 'fs';

let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

// 1. Remove Branch selects (using regex with \r?\n is safe enough)
c = c.replace(/    await page\.selectOption\('select\\[aria-label="Branch"\\]', 'Jakarta'\);\r?\n/g, '');
c = c.replace(/    await page\.selectOption\('select\\[aria-label="Branch"\\]', \{ label: 'Jakarta' \}\);\r?\n/g, '');

// 2. Fix NPWP / Email for BOTH forms
// We use exact strings here
const oldFormWO = "    await page.fill('input[placeholder=\"Postal Code\"]', '12345');\\n    await page.fill('textarea[placeholder=\"Notes\"]', 'Setup WO PO');";
const newFormWO = "    await page.fill('input[placeholder=\"Postal Code\"]', '12345');\\n    await page.fill('input[placeholder=\"NPWP\"]', '01.234.567.8-901.234');\\n    await page.fill('input[placeholder=\"Email\"]', 'client@test.com');\\n    await page.fill('textarea[placeholder=\"Notes\"]', 'Setup WO PO');";
c = c.replace(new RegExp(oldFormWO.replace(/\\n/g, '\\r?\\n')), newFormWO.replace(/\\n/g, '\\n'));

const oldFormDO = "    await page.fill('input[placeholder=\"Postal Code\"]', '12345');\\n    await page.fill('textarea[placeholder=\"Notes\"]', 'Setup DO PO');";
const newFormDO = "    await page.fill('input[placeholder=\"Postal Code\"]', '12345');\\n    await page.fill('input[placeholder=\"NPWP\"]', '01.234.567.8-901.234');\\n    await page.fill('input[placeholder=\"Email\"]', 'client@test.com');\\n    await page.fill('textarea[placeholder=\"Notes\"]', 'Setup DO PO');";
c = c.replace(new RegExp(oldFormDO.replace(/\\n/g, '\\r?\\n')), newFormDO.replace(/\\n/g, '\\n'));


// 3. Fix the WO-SETUP fields (using exact strings)
const oldWOFields = "    await page.fill('input[placeholder=\"Received by\"]', 'John');\\n    await page.fill('input[placeholder=\"Compiled by\"]', 'Jane');\\n    await page.fill('input[placeholder=\"Approved by\"]', 'Director');\\n    await page.fill('input[placeholder=\"Dept Head Service\"]', 'Bob');\\n    await page.fill('input[placeholder=\"Work Performed by\"]', 'Mike');\\n    await page.fill('input[placeholder=\"Scope of Work\"]', 'Full overhaul');\\n    \\n    await page.click('button:has-text(\"Add Unit\")');\\n    await page.locator('input[placeholder=\"Job Desc\"]').first().fill('Engine repair');\\n    await page.locator('input[placeholder=\"Unit Type\"]').first().fill('Generator');\\n    await page.locator('input[placeholder=\"Quantity\"]').first().fill('1');";
const newWOFields = "    await page.fill('input[placeholder=\"Received by\"]', 'John');\\n    await page.fill('input[placeholder=\"Dept Head Service\"]', 'Bob');\\n    await page.fill('input[placeholder=\"Director\"]', 'DirectorName');\\n    await page.fill('input[placeholder=\"Scope of Work\"]', 'Full overhaul');\\n    \\n    await page.click('button:has-text(\"Add Unit\")');\\n    await page.locator('input[placeholder=\"Job Desc\"]').first().fill('Engine repair');\\n    await page.locator('input[placeholder=\"Unit Type\"]').first().fill('Generator');\\n    await page.locator('input[placeholder=\"Quantity\"]').first().fill('1');\\n    await page.locator('input[placeholder=\"Job\"]').first().fill('Install new block');";
// We use a normal string replace to avoid regex escaping hell, but normalize newlines:
let c_normalized = c.replace(/\\r\\n/g, '\\n');
c = c_normalized.replace(oldWOFields.replace(/\\n/g, '\\n'), newWOFields.replace(/\\n/g, '\\n'));


// 4. Add 4xx intercept
c = c.replace(/page = await browser\.newPage\(\);/, 
  `page = await browser.newPage();
    page.on('response', async res => {
      if (res.status() >= 400 && res.url().includes('/api/')) {
        console.log('API ERROR ' + res.status() + ' ' + res.url() + ' BODY:', await res.text().catch(() => 'no body'));
      }
    });`
);

// 5. Save
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Patched fields exactly, removed branch, added API error intercept.');
