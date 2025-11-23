#!/usr/bin/env node
/**
 * Cleanup Script - Remove duplicate 'use client' and dynamic exports
 * Also removes dynamic export from non-page files (components)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

let fixed = 0;
let errors = 0;

function cleanupFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Track if this is a page file
    const isPageFile = /\/page\.(js|jsx|ts|tsx)$/.test(filePath);
    const usesNextDynamic = content.includes("import dynamic from 'next/dynamic'");
    
    // Split into lines
    let lines = content.split('\n');
    let newLines = [];
    let seenUseClient = false;
    let seenDynamicExport = false;
    let skipNext = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip empty lines right after we've seen use client or dynamic export
      if (skipNext && trimmed === '') {
        skipNext = false;
        continue;
      }
      skipNext = false;
      
      // Handle 'use client' directive
      if (trimmed === "'use client';" || trimmed === '"use client";') {
        if (!seenUseClient) {
          newLines.push(line);
          seenUseClient = true;
          skipNext = true;
        }
        continue;
      }
      
      // Handle dynamic export
      if (trimmed === "export const dynamic = 'force-dynamic';" || 
          trimmed === 'export const dynamic = "force-dynamic";') {
        // Only keep if it's a page file AND doesn't use next/dynamic
        if (isPageFile && !usesNextDynamic && !seenDynamicExport) {
          newLines.push(line);
          seenDynamicExport = true;
          skipNext = true;
        }
        continue;
      }
      
      newLines.push(line);
    }
    
    // Reconstruct content
    const newContent = newLines.join('\n');
    
    // Only write if changed
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      fixed++;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error: ${filePath}:`, error.message);
    errors++;
    return false;
  }
}

console.log('🧹 Cleaning up duplicate directives...\n');

// Find all JS/JSX/TS/TSX files in src
const patterns = [
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.tsx',
];

patterns.forEach(pattern => {
  const files = glob.sync(pattern, {
    cwd: process.cwd(),
    ignore: ['**/node_modules/**', '**/.next/**', '**/out/**']
  });
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    cleanupFile(filePath);
  });
});

console.log('\n' + '='.repeat(50));
console.log('📊 Cleanup Summary:');
console.log(`   ✅ Fixed: ${fixed} files`);
console.log(`   ❌ Errors: ${errors} files`);
console.log('='.repeat(50));

if (fixed > 0) {
  console.log('\n✨ Cleanup complete! Now run: npm run build');
}

