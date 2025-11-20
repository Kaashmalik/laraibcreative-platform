#!/usr/bin/env node

/**
 * Generate Blur Placeholder Script
 * 
 * Generates base64-encoded blur placeholders for images.
 * These can be used with Next.js Image component's blurDataURL prop.
 * 
 * Usage:
 *   node scripts/generate-blur-placeholder.js [image-path]
 * 
 * Example:
 *   node scripts/generate-blur-placeholder.js public/images/product.jpg
 * 
 * Requirements:
 *   npm install sharp --save-dev
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const BLUR_WIDTH = 20;
const BLUR_HEIGHT = 20;
const BLUR_QUALITY = 20;

/**
 * Generate blur placeholder from image
 */
async function generateBlurPlaceholder(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ File not found: ${imagePath}`);
      process.exit(1);
    }

    // Check if sharp is installed
    try {
      require('sharp');
    } catch (error) {
      console.error('❌ Sharp is not installed. Please run:');
      console.error('   npm install sharp --save-dev');
      process.exit(1);
    }

    // Generate blur placeholder
    const buffer = await sharp(imagePath)
      .resize(BLUR_WIDTH, BLUR_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: BLUR_QUALITY })
      .toBuffer();

    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    console.log('✅ Blur placeholder generated!\n');
    console.log('Copy this into your Image component:');
    console.log('─'.repeat(60));
    console.log(`blurDataURL="${dataUrl}"`);
    console.log('─'.repeat(60));
    console.log(`\nLength: ${dataUrl.length} characters`);

    // Save to file
    const outputPath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '.blur.txt');
    await fs.promises.writeFile(outputPath, dataUrl, 'utf8');
    console.log(`\n💾 Saved to: ${outputPath}`);

    return dataUrl;
  } catch (error) {
    console.error('❌ Error generating blur placeholder:', error.message);
    process.exit(1);
  }
}

/**
 * Generate generic blur placeholder (SVG)
 */
function generateGenericBlurPlaceholder() {
  const svg = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="20" height="20" fill="#F3F4F6"/>
</svg>`;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('🖼️  Blur Placeholder Generator');
    console.log('==============================\n');
    console.log('Usage:');
    console.log('  node scripts/generate-blur-placeholder.js [image-path]\n');
    console.log('Example:');
    console.log('  node scripts/generate-blur-placeholder.js public/images/product.jpg\n');
    console.log('Generic placeholder (use when no image available):');
    console.log('─'.repeat(60));
    console.log(generateGenericBlurPlaceholder());
    console.log('─'.repeat(60));
    process.exit(0);
  }

  const imagePath = path.resolve(args[0]);
  await generateBlurPlaceholder(imagePath);
}

// Run script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

