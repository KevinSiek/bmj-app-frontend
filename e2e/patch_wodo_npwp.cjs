const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

c = c.replaceAll(/await page\.fill\('input\[placeholder="Postal Code"\]', '12345'\);/g, 
`await page.fill('input[placeholder="Postal Code"]', '12345');
    await page.fill('input[placeholder="NPWP"]', '123456789');
    await page.fill('input[placeholder="Email"]', 'test@example.com');`);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Added NPWP and Email to wo-do.spec.js');
