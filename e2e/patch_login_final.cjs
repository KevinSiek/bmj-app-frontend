const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

const targetRegex = /await page\.click\('button\[type="submit"\]'\);\s*await page\.waitForURL\('\*\*\/menu', \{ timeout: 20000 \}\);/;

const replacement = `const responsePromise = page.waitForResponse(response => response.url().includes('/api/login'));
    await page.click('button[type="submit"]');
    const response = await responsePromise;
    console.log('Login Status:', response.status());
    if (response.status() !== 200) {
      console.log('Login Failed body:', await response.json());
    }
    await page.waitForURL('**/menu', { timeout: 20000 });`;

c = c.replace(targetRegex, replacement);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Added login intercept to wo-do.spec.js');
