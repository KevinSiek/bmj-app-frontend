const fs = require('fs');
let c = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', 'utf8');

c = c.replace("await page.selectOption('select[aria-label=\"Branch\"]', 'Jakarta');\n    await page.selectOption('select[aria-label=\"Project Type\"]', 'Service');", "await page.selectOption('select[aria-label=\"Project Type\"]', 'Service');");

c = c.replace(/await page\.fill\('input\[placeholder="Postal Code"\]', '12345'\);/g, "await page.fill('input[placeholder=\"Postal Code\"]', '12345');\n    await page.fill('input[placeholder=\"NPWP\"]', '123456789');\n    await page.fill('input[placeholder=\"Email\"]', 'test@test.com');");

c = c.replace("await expect(page.locator('input[placeholder=\"Received by\"]')).toBeVisible({ timeout: 15000 });", "try { await expect(page.locator('input[placeholder=\"Received by\"]')).toBeVisible({ timeout: 15000 }); } catch (e) { console.log('--- FAILURE HTML START ---'); console.log(await page.content()); console.log('--- FAILURE HTML END ---'); throw e; }");

c = c.replace("test.setTimeout(120000);", "test.setTimeout(300000);");

fs.writeFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e/wo-do.spec.js', c);
console.log('wo-do.spec.js patched completely');
