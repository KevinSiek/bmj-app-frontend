const fs = require('fs');
const file = 'e2e/patch_all.cjs';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `    page.on('response', async res => {
      if (res.status() >= 400 && res.url().includes('/api/')) {
        console.log('API ERROR ' + res.status() + ' ' + res.url() + ' BODY:', await res.text().catch(() => 'no body'));
      }
    });`;

const newCode = `    page.on('response', async res => {
      if (res.status() >= 400 && res.url().includes('/api/')) {
        console.log('API ERROR ' + res.status() + ' ' + res.url() + ' BODY:', await res.text().catch(() => 'no body'));
      }
      if (res.status() === 200 && res.url().includes('/api/quotation') && res.request().method() === 'GET') {
        const body = await res.json().catch(() => null);
        if (body && body.data && body.data.data) {
          console.log('QUOTATION LIST:', body.data.data.map(q => ({ num: q.quotation_number, cust: q.customer?.company_name, branch: q.branch })));
        }
      }
    });`;

if (content.includes(oldCode)) {
    fs.writeFileSync(file, content.replace(oldCode, newCode));
    console.log("Updated patch_all.cjs!");
} else {
    console.log("oldCode not found.");
}
