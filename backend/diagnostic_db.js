const mongoose = require('mongoose');
require('dotenv').config();

// Define a minimal schema to query
const productSchema = new mongoose.Schema({
    title: String,
    isFeatured: Boolean,
    isActive: Boolean,
    status: String,
    isDeleted: Boolean
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function checkDB() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const total = await Product.countDocuments({});
        const valid = await Product.countDocuments({ isDeleted: { $ne: true } });
        const published = await Product.countDocuments({ status: 'published', isActive: true, isDeleted: { $ne: true } });
        const featured = await Product.countDocuments({ status: 'published', isActive: true, isFeatured: true, isDeleted: { $ne: true } });

        console.log('--- DIAGNOSTIC RESULTS ---');
        console.log(`Total Documents: ${total}`);
        console.log(`Not Deleted: ${valid}`);
        console.log(`Published & Active: ${published}`);
        console.log(`Featured (Published & Active): ${featured}`);
        console.log('--------------------------');

        if (total > 0 && published === 0) {
            console.log('WARN: Products exist but none are published/active.');
        }

    } catch (err) {
        console.error('DB Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkDB();
