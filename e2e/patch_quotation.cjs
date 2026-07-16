const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

const regexQuotation = /await page\.click\('button\.btn-process:has-text\("Add Quotation"\)'\);/;
const replaceQuotation = `const quoteResponsePromise = page.waitForResponse(response => response.url().includes('/api/quotation'));
    await page.click('button.btn-process:has-text("Add Quotation")');
    await page.click('button:has-text("Yes")');
    const quoteResponse = await quoteResponsePromise;
    console.log('Quotation POST Status:', quoteResponse.status());
    if (quoteResponse.status() !== 200) {
        console.log('Quotation Failed body:', await quoteResponse.json());
    }`;
c = c.replace(regexQuotation, replaceQuotation);

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('Added Quotation POST intercept!');
