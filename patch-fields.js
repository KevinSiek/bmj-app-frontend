import fs from 'fs';
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

const targetRegex = /await page\.fill\('input\[placeholder="Received by"\]', 'John'\);[\s\S]*?await page\.locator\('input\[placeholder="Quantity"\]'\)\.first\(\)\.fill\('1'\);/;

const replacement = `await page.fill('input[placeholder="Received by"]', 'John');
    await page.fill('input[placeholder="Dept Head Service"]', 'Bob');
    await page.fill('input[placeholder="Director"]', 'DirectorName');
    await page.fill('input[placeholder="Scope of Work"]', 'Full overhaul');
    
    await page.locator('input[placeholder="Job Desc"]').first().fill('Engine repair');
    await page.locator('input[placeholder="Unit Type"]').first().fill('Generator');
    await page.locator('input[placeholder="Quantity"]').first().fill('1');
    await page.locator('input[placeholder="Job"]').first().fill('Install new block');`;

c = c.replace(targetRegex, replacement);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Patched fields');
