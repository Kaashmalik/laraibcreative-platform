#!/usr/bin/env node
/**
 * Script to automatically add 'export const dynamic = "force-dynamic"' to pages
 * that use authentication
 * 
 * Usage: node scripts/fix-dynamic-export.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to match pages that need dynamic export
const PAGE_PATTERNS = [
  'src/app/admin/**/page.{js,jsx,ts,tsx}',
  'src/app/(customer)/auth/**/page.{js,jsx,ts,tsx}',
  'src/app/(customer)/account/**/page.{js,jsx,ts,tsx}',
  'src/app/(customer)/cart/page.{js,jsx,ts,tsx}',
  'src/app/(customer)/checkout/page.{js,jsx,ts,tsx}',
];

// Exclude patterns
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/out/**',
];

const DYNAMIC_EXPORT_LINE = "export const dynamic = 'force-dynamic';";
const USE_CLIENT_LINE = "'use client';";

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filePath);
  });
}

function hasUseClient(content) {
  return content.includes("'use client'") || content.includes('"use client"');
}

function hasDynamicExport(content) {
  return content.includes("export const dynamic = 'force-dynamic'") ||
         content.includes('export const dynamic = "force-dynamic"') ||
         content.includes("export const dynamic = 'force-static'");
}

function addDynamicExport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Check if already has dynamic export
    if (hasDynamicExport(content)) {
      console.log(`⏭️  Skipped (already has dynamic export): ${filePath}`);
      return false;
    }

    // Find 'use client' line
    const useClientIndex = lines.findIndex(line => 
      line.trim() === "'use client';" || line.trim() === '"use client";'
    );

    if (useClientIndex === -1) {
      // No 'use client' - add both at the beginning
      lines.unshift('', DYNAMIC_EXPORT_LINE, USE_CLIENT_LINE);
      console.log(`✅ Added 'use client' and dynamic export: ${filePath}`);
    } else {
      // Has 'use client' - add dynamic export after it
      lines.splice(useClientIndex + 1, 0, '', DYNAMIC_EXPORT_LINE);
      console.log(`✅ Added dynamic export: ${filePath}`);
    }

    // Write back to file
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Finding pages that need dynamic export...\n');

  let totalFiles = 0;
  let modifiedFiles = 0;
  let skippedFiles = 0;

  PAGE_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    
    files.forEach(file => {
      if (shouldExclude(file)) {
        return;
      }

      totalFiles++;
      const filePath = path.join(process.cwd(), file);
      
      if (addDynamicExport(filePath)) {
        modifiedFiles++;
      } else {
        skippedFiles++;
      }
    });
  });

  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   Total files checked: ${totalFiles}`);
  console.log(`   ✅ Modified: ${modifiedFiles}`);
  console.log(`   ⏭️  Skipped: ${skippedFiles}`);
  console.log('='.repeat(50));

  if (modifiedFiles > 0) {
    console.log('\n✨ Done! All files have been updated.');
    console.log('🔨 Now run: npm run build');
  } else {
    console.log('\n✨ No changes needed. All files already configured.');
  }
}

main();

