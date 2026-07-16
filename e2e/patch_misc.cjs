const fs = require('fs');

let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/guards-quotation.spec.js', 'utf8');
c = c.replace(/{ data: { poNumber:/g, "{ data: { notes: 'test', poNumber:");
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/guards-quotation.spec.js', c);

let b1 = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-shortfall.spec.js', 'utf8');
b1 = b1.replace(/\/api\/borrow\/kembali/g, "/api/borrow/return");
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-shortfall.spec.js', b1);

console.log('Patched!');
