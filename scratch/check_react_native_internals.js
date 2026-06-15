const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.expo') {
        searchDir(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("from 'react-native/") || content.includes('from "react-native/')) {
        console.log(`Found direct react-native internal import in: ${fullPath}`);
      }
    }
  }
}

searchDir('C:\\Users\\Xojamurod\\my-app\\src');
console.log('Search finished.');
