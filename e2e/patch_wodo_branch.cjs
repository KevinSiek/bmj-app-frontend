const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

c = c.replace(/await page\.selectOption\('select\[aria-label="Project Type"\]', 'Service'\);/g, 
`await page.selectOption('select[aria-label="Project Type"]', 'Service');
    await page.selectOption('select[aria-label="Branch"]', 'Jakarta');`);

c = c.replace(/await page\.selectOption\('select\[aria-label="Project Type"\]', 'Spareparts'\);/g, 
`await page.selectOption('select[aria-label="Project Type"]', 'Spareparts');
    await page.selectOption('select[aria-label="Branch"]', 'Jakarta');`);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Fixed Branch in wo-do.spec.js');
