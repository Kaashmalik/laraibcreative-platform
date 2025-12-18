const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Product = require('./src/models/Product');

        // Update products with 'active' status to 'published'
        const result1 = await Product.updateMany(
            { status: 'active' },
            { $set: { status: 'published' } }
        );
        console.log(`Updated ${result1.modifiedCount} products from 'active' to 'published'`);

        // Update products with no status to 'published' (if they are isActive)
        const result2 = await Product.updateMany(
            { status: { $exists: false }, isActive: true },
            { $set: { status: 'published' } }
        );
        console.log(`Updated ${result2.modifiedCount} products with missing status to 'published'`);

        // Fix isFeatured if it used legacy 'featured' field
        const result3 = await Product.updateMany(
            { featured: true, isFeatured: { $ne: true } },
            { $set: { isFeatured: true } }
        );
        console.log(`Updated ${result3.modifiedCount} products with legacy 'featured' field to 'isFeatured'`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
