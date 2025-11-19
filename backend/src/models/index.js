const mongoose = require('mongoose');

// Load models in dependency order
const User = require('./User');
const Settings = require('./Settings');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');

console.log('✓ All models loaded successfully');

module.exports = {
  User,
  Category,
  Product,
  Order,
  Settings,
  
  ensureIndexes: async function() {
    console.log('Creating database indexes...');
    const models = [User, Category, Product, Order, Settings];
    
    for (const Model of models) {
      await Model.createIndexes();
      console.log(`  ✓ ${Model.modelName} indexes created`);
    }
    
    console.log('✓ All indexes created successfully');
  }
};