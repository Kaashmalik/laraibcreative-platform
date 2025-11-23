const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

/**
 * Seed Admin User
 * Creates a default admin user for the platform
 */
const seedAdminUser = async () => {
  try {
    console.log('🌱 Starting admin user seed...');

    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: 'admin@laraibcreative.studio' 
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@laraibcreative.studio');
      console.log('🔑 Role:', existingAdmin.role);
      
      // Optionally update to admin if it's not
      if (existingAdmin.role !== 'admin' && existingAdmin.role !== 'super-admin') {
        existingAdmin.role = 'admin';
        existingAdmin.emailVerified = true;
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
      
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      fullName: 'LaraibCreative Admin',
      email: 'admin@laraibcreative.studio',
      password: 'Admin@12345', // Change this password after first login!
      phone: '+923001234567',
      whatsapp: '+923001234567',
      role: 'admin',
      emailVerified: true,
      isActive: true,
      addresses: []
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@laraibcreative.studio');
    console.log('🔑 Password: Admin@12345');
    console.log('👤 Role:     admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    console.log('\n🔗 Login URL: https://laraibcreative.studio/admin/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
};

// Run seed
seedAdminUser();
