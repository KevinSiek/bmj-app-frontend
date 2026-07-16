const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

c = c.replace(/    const dateInputs = await page\.locator\('input\[type="date"\]'\)\.all\(\);/g, 
`    await expect(page.locator('input[placeholder="Received by"]')).toBeVisible({ timeout: 15000 });
    const dateInputs = await page.locator('input[type="date"]').all();`);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Added Received by wait in wo-do.spec.js');
