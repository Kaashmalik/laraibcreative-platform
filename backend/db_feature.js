const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function featureProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Product = require('./src/models/Product');

        // Get IDs of first 8 published products
        const products = await Product.find({ status: 'published', isDeleted: { $ne: true } }).limit(8).select('_id').lean();
        const ids = products.map(p => p._id);

        // Bulk update
        const result = await Product.updateMany(
            { _id: { $in: ids } },
            { $set: { isFeatured: true } }
        );

        console.log(`Successfully featured ${result.modifiedCount} products.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

featureProducts();
