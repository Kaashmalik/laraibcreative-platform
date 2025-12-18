require('dotenv').config();
const mongoose = require('mongoose');

async function updateProductStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Update all products to set isActive: true
    const result = await mongoose.connection.db.collection('products').updateMany(
      {},
      { $set: { isActive: true, status: 'active' } }
    );
    
    console.log('Updated:', result.modifiedCount, 'products - set isActive: true');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateProductStatus();
