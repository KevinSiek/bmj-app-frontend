const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-shortfall.spec.js', 'utf8');
c = c.replace(/expect\(response\.status\(\)\)\.toBe\(200\);/g, "if (response.status() !== 200) console.error('Status:', response.status(), await response.text());\n    expect(response.status()).toBe(200);");
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-shortfall.spec.js', c);
