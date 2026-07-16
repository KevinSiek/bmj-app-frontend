const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

c = c.replace(/let page;\n  let servicePoId = '';/g, `let page;\n  let servicePoId = '';\n\n  test.beforeAll(async ({ browser }) => {\n    page = await browser.newPage();\n    page.on('console', msg => console.log('PAGE LOG:', msg.text()));\n    page.on('pageerror', error => console.error('PAGE ERROR:', error));\n  });`);

c = c.replace(/test\.beforeAll\(async \(\{\ browser\ \}\) \=> \{\n    page = await browser.newPage\(\);\n  \}\);/g, '');

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Added console listener to wo-do.spec.js');
