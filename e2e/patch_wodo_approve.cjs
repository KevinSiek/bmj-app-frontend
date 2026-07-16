const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

c = c.replace(/    \/\/ Approve it first![\s\S]*?await page\.click\('button:has-text\("Create PO"\)'\);/g, 
`    // The UI is already on /quotation page
    await page.locator('.list .item').first().click();
    const createPoBtn = page.locator('button:has-text("Create PO")');
    await expect(createPoBtn).toBeVisible({ timeout: 15000 });
    await createPoBtn.click();`);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Removed Approve step in wo-do.spec.js');
