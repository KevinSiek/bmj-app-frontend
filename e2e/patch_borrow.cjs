const fs = require('fs');
const lines = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-lifecycle-api.spec.js', 'utf8');
const c = lines.replace(/expect\(returnRes\.status\(\)\)\.toBe\(200\);/, "if (returnRes.status() !== 200) console.error(await returnRes.text());\n    expect(returnRes.status()).toBe(200);");
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-lifecycle-api.spec.js', c);

const l2 = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-shortfall.spec.js', 'utf8');
const c2 = l2.replace(/expect\(returnRes\.status\(\)\)\.toBe\(200\);/, "if (returnRes.status() !== 200) console.error(await returnRes.text());\n    expect(returnRes.status()).toBe(200);");
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-shortfall.spec.js', c2);

console.log('Patched!');
