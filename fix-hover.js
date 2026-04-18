const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    let dirPath = path.join(dir, file);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (file !== 'node_modules' && file !== '.next') {
        walkDir(dirPath, callback);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx')) {
      callback(dirPath);
    }
  });
};

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove `onMouseOver={(e) => ...}` and `onMouseOut={(e) => ...}`
  content = content.replace(/\bonMouseOver=\{[^\}]+\}/g, '');
  content = content.replace(/\bonMouseOut=\{[^\}]+\}/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed hovers in', filePath);
  }
};

walkDir('./components', processFile);
walkDir('./app', processFile);
