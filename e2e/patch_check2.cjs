const fs = require('fs');
const code = fs.readFileSync('e:/Kerja/Kerja/Bkawan/PT_BerkatMegahJaya/Code/FrontEnd/bmj-app-frontend/src/views/menu/QuotationPage.vue', 'utf8');
const match = code.match(/class="action[^"]*"[\s\S]*?<\/div>/);
console.log(match ? match[0] : 'Not found');
