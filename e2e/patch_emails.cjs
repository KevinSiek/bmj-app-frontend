const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

c = c.replace(/citra\.k@bmj\.com/g, 'marketing.jkt@bmj.com');
c = c.replace(/fajar\.n@bmj\.com/g, 'finance.jkt@bmj.com');
c = c.replace(/eko\.p@bmj\.com/g, 'inventory.admin.jkt@bmj.com');

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Updated emails in wo-do.spec.js');
