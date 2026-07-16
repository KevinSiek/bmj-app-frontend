const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/customer-seller.spec.js', 'utf8');
c = c.replace(/pic_phone:\s*'08123456789'\s*\n\s*}/, "pic_phone: '08123456789',\n          npwp: '123', email: 'e2e@bmj.com'\n        }");
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/customer-seller.spec.js', c);
