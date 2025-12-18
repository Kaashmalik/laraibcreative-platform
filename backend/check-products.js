require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const checkProducts = async () => {
    await connectDB();

    try {
        const total = await Product.countDocuments();
        console.log(`Total products: ${total}`);

        const published = await Product.countDocuments({ status: 'published' });
        console.log(`Published products: ${published}`);

        const active = await Product.countDocuments({ isActive: true });
        console.log(`Active products: ${active}`);

        const featured = await Product.countDocuments({ isFeatured: true });
        console.log(`Featured products: ${featured}`);

        const validFeatured = await Product.countDocuments({
            isFeatured: true,
            status: 'published',
            isActive: true,
            isDeleted: { $ne: true }
        });
        console.log(`Valid featured products (should show on home): ${validFeatured}`);

        if (validFeatured === 0) {
            console.log('No valid featured products found. Listing potential candidates...');
            const candidates = await Product.find().limit(5);
            candidates.forEach(p => {
                console.log(`- ${p.title} (Status: ${p.status}, Active: ${p.isActive}, Featured: ${p.isFeatured}, Deleted: ${p.isDeleted})`);
            });
        }

    } catch (error) {
        console.error('Error checking products:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkProducts();
