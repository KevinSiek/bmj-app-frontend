const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-shortfall.spec.js', 'utf8');

c = c.replace(/subdistrict: 'Sub'/g, "subdistrict: 'Sub', npwp: '123', email: 'e2e@bmj.com'");

// 1. Move Sparepart PO creation UP before Return
const poBlockStart = c.indexOf('// 6. Create a Sparepart PO to cover the shortfall');
const poBlockEnd = c.indexOf('// 7. Retry Reconcile');
const poBlock = c.substring(poBlockStart, poBlockEnd);
c = c.substring(0, poBlockStart) + c.substring(poBlockEnd);

const returnStepIndex = c.indexOf('// 4. Return (Kembali) the borrow');
c = c.substring(0, returnStepIndex) + poBlock + '\n    ' + c.substring(returnStepIndex);

// 2. Change the 'Return' step to include the shortfall data and PO.
c = c.replace(
  /response = await apiContext\.post\(\`\/api\/borrow\/return\/\$\{borrowId\}\`, \{ data: \{ notes: 'Returning to warehouse' \} \}\);/,
  "response = await apiContext.post(`/api/borrow/return/${borrowId}`, { data: { returnNotes: 'Returning to warehouse', returned: [{ sparepartId, quantityReturn: returnQty }], sparepartPoId: shortfallPoId } });"
);

// 3. Remove the bad Attempt Reconcile
const attemptDoneStart = c.indexOf('// 5. Attempt Reconcile');
const attemptDoneEnd = c.indexOf('response = await apiContext.post(`/api/borrow/done/${borrowId}`, {\n      data: {\n        returned: [{ sparepartId, quantityReturn: returnQty }],\n        sparepartPoId: shortfallPoId\n      }\n    });');
c = c.substring(0, attemptDoneStart) + c.substring(attemptDoneEnd);

// 4. Add Receive and rewrite the good Done
c = c.replace(
  /response = await apiContext\.post\(\`\/api\/borrow\/done\/\$\{borrowId\}\`, \{\s*data:\s*\{\s*returned: \[\{ sparepartId, quantityReturn: returnQty \}\],\s*sparepartPoId: shortfallPoId\s*\}\s*\}\);/,
  "await apiContext.post(`/api/borrow/receive/${borrowId}`);\n    response = await apiContext.post(`/api/borrow/done/${borrowId}`);"
);

c = c.replace('// 7. Retry Reconcile', '// 5. Receive and Reconcile');
c = c.replace('// 8. Verify stock', '// 6. Verify stock');
fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-shortfall.spec.js', c);
