const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

c = c.replace(/    await page\.click\('button\\[type="submit"\\]'\);\n    await page\.waitForURL\('\*\*\\/menu', \{ timeout: 30000 \}\);/g, 
`    const responsePromise = page.waitForResponse(response => response.url().includes('/api/login'));
    await page.click('button[type="submit"]');
    const response = await responsePromise;
    console.log('Login Status:', response.status());
    await page.waitForURL('**/menu', { timeout: 30000 });`);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Added login intercept to wo-do.spec.js');
