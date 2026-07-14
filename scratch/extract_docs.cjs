const fs = require('fs');
const path = require('path');

const docsDir = path.join(process.cwd(), 'docs');
const docFiles = fs.readdirSync(docsDir).filter(f => f.startsWith('FEATURE_') && f.endsWith('.md'));

const results = [];

docFiles.forEach(file => {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
    const matches = content.match(/^(#{1,3})\s+(.*)/gm);
    if (matches) {
        results.push(`\n=== ${file} ===`);
        matches.forEach(match => results.push(match));
    }
});

fs.writeFileSync(path.join(process.cwd(), 'scratch/doc_features.txt'), results.join('\n'));
console.log(`Extracted features to scratch/doc_features.txt`);
