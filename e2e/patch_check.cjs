const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Lukas_K/.gemini/antigravity-ide/brain/6f26b4fa-be89-4f94-8167-8ef553a01530/.system_generated/tasks/task-880.log', 'utf8');
const errs = lines.match(/{"message":"[^"]+"/g) || lines.match(/console\.error.*/g) || [];
console.log(errs.join('\n'));
