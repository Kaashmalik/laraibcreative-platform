#!/usr/bin/env node
/**
 * Add 'export const dynamic = "force-dynamic"' ONLY to page files
 * that use authentication and don't use next/dynamic import
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

let fixed = 0;

function addDynamicToPage(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has dynamic export
    if (content.includes("export const dynamic = ")) {
      return false;
    }
    
    // Skip if uses next/dynamic import (will cause conflicts)
    if (content.includes("from 'next/dynamic'") || content.includes('from "next/dynamic"')) {
      console.log(`⏭️  Skipped (uses next/dynamic): ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
    
    // Check if it has 'use client'
    const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
    
    if (!hasUseClient) {
      // Add both 'use client' and dynamic export
      content = "'use client';\n\nexport const dynamic = 'force-dynamic';\n\n" + content;
    } else {
      // Add dynamic export after 'use client'
      content = content.replace(
        /('use client';|"use client";)\s*\n/,
        "$1\n\nexport const dynamic = 'force-dynamic';\n\n"
      );
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    fixed++;
    return true;
  } catch (error) {
    console.error(`❌ Error: ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Adding dynamic export to page files...\n');

// Only target page files in specific directories
const pagePatterns = [
  'src/app/admin/**/page.{js,jsx,ts,tsx}',
  'src/app/admin/**/layout.{js,jsx,ts,tsx}',
  'src/app/(customer)/auth/**/page.{js,jsx,ts,tsx}',
  'src/app/(customer)/account/**/page.{js,jsx,ts,tsx}',
  'src/app/(customer)/cart/page.{js,jsx,ts,tsx}',
  'src/app/(customer)/checkout/page.{js,jsx,ts,tsx}',
  'src/app/(customer)/custom-order/page.{js,jsx,ts,tsx}',
];

pagePatterns.forEach(pattern => {
  const files = glob.sync(pattern, {
    cwd: process.cwd(),
    ignore: ['**/node_modules/**', '**/.next/**']
  });
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    addDynamicToPage(filePath);
  });
});

console.log('\n' + '='.repeat(50));
console.log(`📊 Added dynamic export to ${fixed} page files`);
console.log('='.repeat(50));

if (fixed > 0) {
  console.log('\n✨ Done! Now run: npm run build');
}

