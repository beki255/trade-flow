const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('c:/tradeflow-v2/services/api/prisma/generated-client');
const destDir = path.resolve('c:/tradeflow-v2/node_modules/.prisma/client');

const files = fs.readdirSync(srcDir);
for (const file of files) {
  if (file.endsWith('.node')) {
    console.log('Skipping engine binary:', file);
    continue;
  }
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log('Copied directory:', file);
  } else {
    fs.copyFileSync(src, dest);
    console.log('Copied file:', file);
  }
}

// Also copy schema.prisma
fs.copyFileSync(
  'c:/tradeflow-v2/services/api/prisma/schema.prisma',
  'c:/tradeflow-v2/node_modules/.prisma/client/schema.prisma'
);
console.log('Copied schema.prisma');
console.log('All client files synced successfully!');
