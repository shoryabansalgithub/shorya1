const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps/api/src');

const N_PLUS_1_REGEX = /for\s*\([^)]+\)\s*\{[^}]*await\s+this\.prisma\.[a-zA-Z0-9_]+\.(findUnique|findFirst|findMany|update|create|delete)[^}]*\}/s;
// A simplified way: look for loops, then see if the loop body contains Prisma calls.
// Actually, it's easier to just read line by line.

let issues = [];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.ts') && !full.endsWith('.spec.ts')) {
      analyzeFile(full);
    }
  }
}

function analyzeFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  let inLoop = false;
  let loopStartLine = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check missing pagination in findMany
    if (line.includes('.findMany({')) {
      // Look ahead up to 20 lines for 'take:' or 'skip:'
      let hasPagination = false;
      for(let j = i; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].includes('take:') || lines[j].includes('skip:')) {
          hasPagination = true;
          break;
        }
        if (lines[j].includes('})')) {
           break;
        }
      }
      if (!hasPagination) {
         // Some findMany queries are constrained by where clauses that naturally limit them,
         // but large table scans are an issue.
         if (content.includes('OcrService') && line.includes('product.findMany')) {
             issues.push({ type: 'Table Scan', file, line: i + 1, detail: 'OcrService fuzzyMatchProducts does a full product table scan' });
         } else {
             issues.push({ type: 'Missing Pagination', file, line: i + 1, detail: 'findMany called without take/skip' });
         }
      }
    }
    
    // Check N+1 (Prisma call inside loop)
    // Basic heuristic: check if `await this.prisma` is indented inside a for loop.
    if (line.match(/for\s*\(.*of.*\)/)) {
      inLoop = true;
      loopStartLine = i;
    }
    if (inLoop && line.includes('await this.prisma.')) {
      issues.push({ type: 'N+1 Query Smell', file, line: i + 1, detail: 'Prisma query inside for...of loop' });
    }
    if (inLoop && line.includes('}')) {
      // crude block matching
    }
  }
}

walk(srcDir);
fs.writeFileSync('perf_audit_results.json', JSON.stringify(issues, null, 2));
console.log(`Found ${issues.length} potential performance issues.`);
