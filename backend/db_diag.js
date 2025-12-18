const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Product = require('./src/models/Product');
        const products = await Product.find({ isDeleted: { $ne: true } });

        console.log(`Total non-deleted products found: ${products.length}`);

        const statusCounts = {};
        products.forEach(p => {
            statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
            console.log(`Product: ${p.title} | Status: ${p.status} | Active: ${p.isActive} | Featured: ${p.isFeatured}`);
        });

        console.log('\nStatus Breakdown:');
        console.log(JSON.stringify(statusCounts, null, 2));

        const publishedCount = await Product.countDocuments({ status: 'published', isActive: true, isDeleted: { $ne: true } });
        const featuredCount = await Product.countDocuments({ isFeatured: true, status: 'published', isActive: true, isDeleted: { $ne: true } });

        console.log(`Published and Active Count: ${publishedCount}`);
        console.log(`Featured Count (published/active): ${featuredCount}`);

        process.exit(0);
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnose();
