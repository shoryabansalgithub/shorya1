const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We want to match:
      // @Transform(({ value }) => parseInt(value, 10))
      // @EnvVariable('SOME_VAR')
      // readonly someVar: number = 42;
      
      const regex = /@Transform\(\(\{ value \}\) => parseInt\(value, 10\)\)\s*@EnvVariable\('([^']+)'\)\s*(?:readonly\s+)?(\w+)\s*:\s*number\s*=\s*(\d+);/g;
      
      const newContent = content.replace(regex, (match, envVar, propName, defValue) => {
        return `@Transform(({ value }) => (value ? parseInt(value, 10) : ${defValue}))\n  @EnvVariable('${envVar}')\n  ${content.includes(`readonly ${propName}`) ? 'readonly ' : ''}${propName}: number = ${defValue};`;
      });
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Fixed ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'apps/api/src/config/domains'));
