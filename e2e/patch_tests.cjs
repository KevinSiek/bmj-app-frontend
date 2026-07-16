const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-shortfall.spec.js', 'utf8');

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


let b = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-lifecycle-api.spec.js', 'utf8');

// 1. Move Sparepart PO up
const poB1 = b.indexOf('// 8. Provision a Sparepart PO');
const poB2 = b.indexOf('// 9. Attach covering PO');
const poText = b.substring(poB1, poB2);
b = b.substring(0, poB1) + b.substring(poB2);

const retStep = b.indexOf('// 5. Marketing Returns Borrow');
b = b.substring(0, retStep) + poText + '\n    ' + b.substring(retStep);

// 2. Add sparepartPoId to return payload
b = b.replace(
  /returned: \[\{ sparepartId: sp\.id, quantityReturn: 3 \}\]/,
  "returned: [{ sparepartId: sp.id, quantityReturn: 3 }], sparepartPoId: coveringPoId"
);

// 3. Remove done fail
const doneFail1 = b.indexOf('// 7. Inventory tries to mark Done');
const doneFail2 = b.indexOf('// 9. Attach covering PO');
b = b.substring(0, doneFail1) + b.substring(doneFail2);

// 4. Fix done payload
b = b.replace(
  /const doneSuccess = await inv\.post\(\`\/api\/borrow\/done\/\$\{borrow\.id\}\`, \{\s*data: \{ sparepartPoId: coveringPoId \}\s*\}\);/,
  "const doneSuccess = await inv.post(`/api/borrow/done/${borrow.id}`);"
);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/borrow-lifecycle-api.spec.js', b);

console.log('Fixed both tests!');
