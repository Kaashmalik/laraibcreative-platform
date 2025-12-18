const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/laraibcreative')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

async function getCategoriesWithNames() {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true, isDeleted: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          categoryId: '$_id',
          name: '$categoryInfo.name',
          slug: '$categoryInfo.slug',
          count: 1
        }
      }
    ]);
    
    console.log('Categories with names:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}): ${cat.count} products`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getCategoriesWithNames();
