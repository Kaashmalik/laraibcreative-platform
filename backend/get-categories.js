const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/laraibcreative')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Product = require('./src/models/Product');

async function getCategories() {
  try {
    const categories = await Product.distinct('category');
    console.log('Available categories:', categories);
    
    // Get count for each category
    const categoryCounts = await Product.aggregate([
      { $match: { isActive: true, isDeleted: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nCategory counts:');
    categoryCounts.forEach(cat => {
      console.log(`- ${cat._id}: ${cat.count} products`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getCategories();
