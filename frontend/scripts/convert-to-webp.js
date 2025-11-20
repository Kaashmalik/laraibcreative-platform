#!/usr/bin/env node

/**
 * Image Conversion Script - Convert images to WebP format
 * 
 * This script converts JPG/PNG images to WebP format for better performance.
 * 
 * Usage:
 *   node scripts/convert-to-webp.js [input-dir] [output-dir]
 * 
 * Example:
 *   node scripts/convert-to-webp.js public/images public/images/webp
 * 
 * Requirements:
 *   npm install sharp --save-dev
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const DEFAULT_INPUT_DIR = path.join(process.cwd(), 'public', 'images');
const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'webp');
const QUALITY = 80; // WebP quality (1-100)
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];

/**
 * Check if file is an image
 */
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_FORMATS.includes(ext);
}

/**
 * Convert image to WebP
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    const stats = await fs.promises.stat(inputPath);
    if (!stats.isFile()) return;

    const ext = path.extname(inputPath).toLowerCase();
    if (!isImageFile(inputPath)) {
      console.log(`⏭️  Skipping ${inputPath} (not a supported image format)`);
      return;
    }

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    await fs.promises.mkdir(outputDir, { recursive: true });

    // Convert to WebP
    await sharp(inputPath)
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const inputSize = stats.size;
    const outputStats = await fs.promises.stat(outputPath);
    const outputSize = outputStats.size;
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

    console.log(`✅ Converted: ${path.basename(inputPath)}`);
    console.log(`   ${(inputSize / 1024).toFixed(2)} KB → ${(outputSize / 1024).toFixed(2)} KB (${savings}% smaller)`);
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error.message);
  }
}

/**
 * Process directory recursively
 */
async function processDirectory(inputDir, outputDir, baseDir = inputDir) {
  try {
    const entries = await fs.promises.readdir(inputDir, { withFileTypes: true });

    for (const entry of entries) {
      const inputPath = path.join(inputDir, entry.name);
      const relativePath = path.relative(baseDir, inputPath);
      const outputPath = path.join(outputDir, relativePath).replace(/\.(jpg|jpeg|png)$/i, '.webp');

      if (entry.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(inputPath, outputDir, baseDir);
      } else if (entry.isFile() && isImageFile(entry.name)) {
        // Convert image file
        await convertToWebP(inputPath, outputPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${inputDir}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputDir = args[0] || DEFAULT_INPUT_DIR;
  const outputDir = args[1] || DEFAULT_OUTPUT_DIR;

  console.log('🖼️  Image to WebP Converter');
  console.log('============================\n');
  console.log(`Input directory: ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Quality: ${QUALITY}\n`);

  // Check if input directory exists
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Input directory does not exist: ${inputDir}`);
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

  // Process images
  console.log('Starting conversion...\n');
  await processDirectory(inputDir, outputDir);

  console.log('\n✅ Conversion complete!');
  console.log('\nNext steps:');
  console.log('1. Update image references to use .webp files');
  console.log('2. Test images in different browsers');
  console.log('3. Consider using <picture> element for fallback support');
}

// Run script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

