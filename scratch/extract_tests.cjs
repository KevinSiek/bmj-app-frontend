const fs = require('fs');
const path = require('path');

const e2eDir = path.join(process.cwd(), 'e2e');
const testFiles = fs.readdirSync(e2eDir).filter(f => f.endsWith('.spec.js'));

const results = [];

testFiles.forEach(file => {
    const content = fs.readFileSync(path.join(e2eDir, file), 'utf8');
    const matches = content.match(/test\(['"](.*?)['"]/g);
    if (matches) {
        matches.forEach(match => {
            const title = match.replace(/test\(['"]/, '').replace(/['"]$/, '');
            results.push(`[${file}] ${title}`);
        });
    }
});

fs.writeFileSync(path.join(process.cwd(), 'scratch/test_titles.txt'), results.join('\n'));
console.log(`Extracted ${results.length} tests to scratch/test_titles.txt`);
