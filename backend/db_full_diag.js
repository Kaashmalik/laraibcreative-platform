const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Product = require('./src/models/Product');
        const products = await Product.find({ isDeleted: { $ne: true } }).select('title status isActive isFeatured featured').lean();

        console.log('START_DATA');
        console.log(JSON.stringify(products, null, 2));
        console.log('END_DATA');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnose();
