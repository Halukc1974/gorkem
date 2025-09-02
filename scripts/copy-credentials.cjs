const fs = require('fs');
const path = require('path');

function copyIfExists(src, destDir) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, path.basename(src));
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} -> ${dest}`);
}

const workspaceRoot = path.join(__dirname, '..');
const distCredDir = path.join(workspaceRoot, 'dist', 'credentials');

// Common credential filenames in this repo
copyIfExists(path.join(workspaceRoot, 'gorkeminsaat-02871cc1db5d.json'), distCredDir);

console.log('Credential copy complete.');
