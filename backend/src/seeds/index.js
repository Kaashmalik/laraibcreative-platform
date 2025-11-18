// ==========================================
// MAIN SEED INDEX
// ==========================================
// Runs all seed scripts in order
// Run: npm run seed
// ==========================================

require('dotenv').config();
const { seedCategories } = require('./categories.seed');
const { seedProducts } = require('./products.seed');

const runAllSeeds = async () => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🌱 LARAIB CREATIVE - DATABASE SEEDING');
    console.log('='.repeat(60) + '\n');

    // Step 1: Seed Categories
    console.log('📦 Step 1: Seeding Categories...');
    await seedCategories();
    console.log('✅ Categories seeded successfully\n');

    // Step 2: Seed Products (requires categories)
    console.log('📦 Step 2: Seeding Products...');
    await seedProducts();
    console.log('✅ Products seeded successfully\n');

    console.log('='.repeat(60));
    console.log('✅ ALL SEEDS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runAllSeeds();
}

module.exports = { runAllSeeds };

