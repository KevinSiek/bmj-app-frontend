const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.spec.js')) results.push(file);
    }
  });
  return results;
}

const files = walk('e2e');
let changed = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/data:\s*\{\s*notes:\s*('[^']+'|"[^"]+")\s*\}/g, (match, notes) => {
    return `data: { notes: ${notes}, poNumber: \`PO-\${Date.now()}-\${Math.floor(Math.random()*1000)}\` }`;
  });
  content = content.replace(/data:\s*\{\s*\}/g, `data: { poNumber: \`PO-\${Date.now()}-\${Math.floor(Math.random()*1000)}\` }`);
  if (content !== original) {
    fs.writeFileSync(file, content);
    changed++;
    console.log('Fixed', file);
  }
}
console.log('Total fixed files:', changed);
