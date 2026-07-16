const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

// 1. Change marketing login to director for both WO and DO setups so they can Approve.
c = c.replace(/'marketing\.jkt@bmj\.com'/g, "'director.jkt@bmj.com'");

// 2. Add Approve step for WO-SETUP
const woMovePoStart = c.indexOf('    // Move to PO — intercept API response to capture new PO ID');
const approveBlock = `    // Approve it first!
    await page.locator('.list .item').first().click();
    await page.click('button:has-text("Approve")');
    await page.fill('.modal-body textarea', 'Approved');
    await page.click('.button-modal button:has-text("Approve")');
    await page.click('button:has-text("Yes")');
    await closeModal(page);
    await page.waitForTimeout(1000);

`;
c = c.substring(0, woMovePoStart) + approveBlock + c.substring(woMovePoStart);

// 3. Add Approve step for DO-SETUP
// The comment in DO-SETUP is just "// Move to PO"
// We need to find the specific one inside DO-SETUP.
const doSetupStart = c.indexOf("test('DO-SETUP:");
const doMovePoStart = c.indexOf('    // Move to PO', doSetupStart);
c = c.substring(0, doMovePoStart) + approveBlock + c.substring(doMovePoStart);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Patched wo-do.spec.js');
