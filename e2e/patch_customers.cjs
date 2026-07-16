const fs = require('fs');
const path = require('path');
const dir = 'e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/e2e';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));

let changed = 0;
for (const file of files) {
  const p = path.join(dir, file);
  let c = fs.readFileSync(p, 'utf8');
  
  let newC = c.replace(/subdistrict:\s*'[^']+'\s*}/g, (match) => {
    if (match.includes('npwp')) return match;
    return match.replace('}', ", npwp: '123', email: 'e2e@bmj.com' }");
  });

  newC = newC.replace(/subdistrict:\s*'[^']+',?\s*\n\s*}/g, (match) => {
    if (match.includes('npwp')) return match;
    return match.replace('}', "npwp: '123', email: 'e2e@bmj.com',\n        }");
  });

  if (c !== newC) {
    fs.writeFileSync(p, newC);
    changed++;
    console.log('Updated ' + file);
  }
}
console.log('Changed ' + changed + ' files.');
