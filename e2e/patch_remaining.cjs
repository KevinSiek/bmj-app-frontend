const fs = require('fs');

let fv3 = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/feature-verify-3.spec.js', 'utf8');
fv3 = fv3.replace(/postalCode: '12345',/g, "postalCode: '12345', npwp: '123', email: 'e2e@bmj.com',");
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/feature-verify-3.spec.js', fv3);

let gq = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/guards-quotation.spec.js', 'utf8');
gq = gq.replace(/subdistrict: 'S'\s*}/g, "subdistrict: 'S', npwp: '123', email: 'e2e@bmj.com' }");
gq = gq.replace(/subdistrict: 'S'\s*\n\s*}/g, "subdistrict: 'S', npwp: '123', email: 'e2e@bmj.com'\n        }");
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/guards-quotation.spec.js', gq);

console.log('Patched the two missing files!');
