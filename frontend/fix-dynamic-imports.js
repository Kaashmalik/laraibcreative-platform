#!/usr/bin/env node
/**
 * Fix dynamic import conflicts
 * Renames 'import dynamic' to 'import dynamicImport' in files that have export const dynamic
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

let fixed = 0;

function fixDynamicImport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has both export const dynamic and import dynamic
    const hasDynamicExport = /export const dynamic = ['"]force-dynamic['"]/.test(content);
    const hasDynamicImport = /import dynamic from ['"]next\/dynamic['"]/.test(content);
    
    if (hasDynamicExport && hasDynamicImport) {
      // Replace import dynamic with import dynamicImport
      let newContent = content.replace(
        /import dynamic from ['"]next\/dynamic['"]/g,
        "import dynamicImport from 'next/dynamic'"
      );
      
      // Replace all uses of dynamic( with dynamicImport(
      // But NOT the export const dynamic line
      newContent = newContent.replace(
        /(?<!export const )dynamic\s*\(/g,
        'dynamicImport('
      );
      
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed dynamic import: ${filePath}`);
      fixed++;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error: ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing dynamic import conflicts...\n');

// Find page files
const patterns = [
  'src/app/**/page.js',
  'src/app/**/page.jsx',
  'src/app/**/page.ts',
  'src/app/**/page.tsx',
];

patterns.forEach(pattern => {
  const files = glob.sync(pattern, {
    cwd: process.cwd(),
    ignore: ['**/node_modules/**', '**/.next/**']
  });
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    fixDynamicImport(filePath);
  });
});

console.log('\n' + '='.repeat(50));
console.log(`📊 Fixed ${fixed} files with dynamic import conflicts`);
console.log('='.repeat(50));

