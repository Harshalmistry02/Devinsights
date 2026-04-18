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

  // 1. Remove rounded corners
  content = content.replace(/\brounded-(xl|lg|md|sm|2xl|3xl|none)\b/g, '');
  content = content.replace(/\brounded\b/g, '');

  // 2. Remove slate/gray/zinc backgrounds
  content = content.replace(/\bbg-[a-z]+-[0-9]{2,4}(\/[0-9]+)?\b/g, (match) => {
    if (match.includes('slate') || match.includes('gray') || match.includes('zinc') || match.includes('neutral') || match.includes('card')) {
        return '';
    }
    return match;
  });

  // 3. Remove slate/gray borders and replace with stark ghost border
  content = content.replace(/\bborder-[a-z]+-[0-9]{2,4}(\/[0-9]+)?\b/g, (match) => {
    if (match.includes('slate') || match.includes('gray') || match.includes('zinc') || match.includes('neutral')) {
        return 'border-[rgba(240,240,250,0.15)]';
    }
    return match;
  });

  // 4. Transform slates/grays text to text-dim equivalent
  content = content.replace(/\btext-[a-z]+-[0-9]{2,4}(\/[0-9]+)?\b/g, (match) => {
    if (match.includes('slate') || match.includes('gray') || match.includes('zinc') || match.includes('neutral') || match.includes('muted')) {
        return 'opacity-80';
    }
    if (match.includes('cyan') || match.includes('blue')) {
        return 'text-[#f0f0fa]';
    }
    return match;
  });

  // 5. Remove shadows
  content = content.replace(/\bshadow(-[a-z]+)?\b/g, '');

  // 6. Enforce sharp edges where border exists but radius was removed
  // Actually, we already removed `rounded-*`, which defaults to 0px.

  // Whitespace cleanup
  content = content.replace(/className=(["`])([^"`]+)\1/g, (match, quote, classes) => {
    return 'className=' + quote + classes.replace(/\s+/g, ' ').trim() + quote;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed', filePath);
  }
};

walkDir('./components', processFile);
walkDir('./app', processFile);
