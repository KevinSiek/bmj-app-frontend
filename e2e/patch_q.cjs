const fs = require('fs');

let code = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/helpers.js', 'utf8');
code = code.replace(/export async function provisionQuotationAndPo\(director, type = 'Spareparts'\)/, "export async function provisionQuotationAndPo(director, type = 'Spareparts', quantity = 1)");
code = code.replace(/spareparts: \[\{ sparepartId: sp\.id, quantity: 1, unitPriceSell: 50000 \}\]/, "spareparts: [{ sparepartId: sp.id, quantity: quantity, unitPriceSell: 50000 }]");
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/helpers.js', code);

let b = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-lifecycle-api.spec.js', 'utf8');
b = b.replace(/const \{ poId: coveringPoId \} = await provisionQuotationAndPo\(adminContext, 'Spareparts'\);/, "const { poId: coveringPoId } = await provisionQuotationAndPo(adminContext, 'Spareparts', 2);");
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-lifecycle-api.spec.js', b);
