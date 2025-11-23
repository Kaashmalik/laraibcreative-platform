#!/usr/bin/env node
/**
 * Master Fix Script - Fixes all build issues
 * 1. Removes duplicate 'use client' and dynamic exports
 * 2. Removes dynamic export from components (non-page files)
 * 3. Fixes dynamic import conflicts in pages
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

let totalFixed = 0;
let errors = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Determine file type
    const isPageFile = /\/page\.(js|jsx|ts|tsx)$/.test(filePath);
    const isLayoutFile = /\/layout\.(js|jsx|ts|tsx)$/.test(filePath);
    const shouldHaveDynamic = isPageFile || isLayoutFile;
    
    // Check if uses next/dynamic
    const usesNextDynamic = content.includes("from 'next/dynamic'") || content.includes('from "next/dynamic"');
    
    // Split into lines
    let lines = content.split('\n');
    let newLines = [];
    let seenUseClient = false;
    let seenDynamicExport = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Handle 'use client' - only keep first occurrence
      if (trimmed === "'use client';" || trimmed === '"use client";') {
        if (!seenUseClient) {
          newLines.push(line);
          seenUseClient = true;
        }
        continue;
      }
      
      // Handle dynamic export
      if (trimmed.startsWith("export const dynamic = '") || trimmed.startsWith('export const dynamic = "')) {
        // Only keep if:
        // 1. It's a page/layout file
        // 2. Doesn't use next/dynamic import
        // 3. Haven't seen it before
        if (shouldHaveDynamic && !usesNextDynamic && !seenDynamicExport) {
          newLines.push(line);
          seenDynamicExport = true;
        }
        continue;
      }
      
      newLines.push(line);
    }
    
    let newContent = newLines.join('\n');
    
    // Fix dynamic import conflicts
    if (usesNextDynamic && shouldHaveDynamic) {
      // Don't add export const dynamic if using next/dynamic
      newContent = newContent.replace(
        /import dynamic from ['"]next\/dynamic['"]/g,
        "import dynamicImport from 'next/dynamic'"
      );
      
      // Replace dynamic( with dynamicImport(
      // Use word boundary to avoid replacing other uses
      newContent = newContent.replace(
        /\bdynamic\s*\(/g,
        'dynamicImport('
      );
    }
    
    // Clean up multiple consecutive blank lines
    newContent = newContent.replace(/\n{3,}/g, '\n\n');
    
    // Write if changed
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      const fileType = isPageFile ? '📄 Page' : isLayoutFile ? '📐 Layout' : '🧩 Component';
      console.log(`✅ ${fileType}: ${path.relative(process.cwd(), filePath)}`);
      totalFixed++;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error: ${filePath}:`, error.message);
    errors++;
    return false;
  }
}

console.log('🚀 Starting comprehensive fix...\n');

// Process all relevant files
const patterns = [
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.tsx',
];

const allFiles = new Set();
patterns.forEach(pattern => {
  const files = glob.sync(pattern, {
    cwd: process.cwd(),
    ignore: ['**/node_modules/**', '**/.next/**', '**/out/**', '**/dist/**']
  });
  files.forEach(f => allFiles.add(path.join(process.cwd(), f)));
});

console.log(`Found ${allFiles.size} files to check\n`);

allFiles.forEach(filePath => {
  fixFile(filePath);
});

console.log('\n' + '='.repeat(60));
console.log('📊 Fix Summary:');
console.log(`   ✅ Fixed: ${totalFixed} files`);
console.log(`   ❌ Errors: ${errors} files`);
console.log(`   📁 Total checked: ${allFiles.size} files`);
console.log('='.repeat(60));

if (totalFixed > 0) {
  console.log('\n✨ Fixes applied! Now run:');
  console.log('   npm run build');
} else if (errors === 0) {
  console.log('\n✨ No issues found! Try building:');
  console.log('   npm run build');
}

