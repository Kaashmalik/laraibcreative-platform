const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB } = require('../config/db');
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

    const ADMIN_EMAIL = 'laraibcreative.business@gmail.com';
    const ADMIN_PASSWORD = 'Admin@123456';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email:', ADMIN_EMAIL);
      console.log('🔑 Role:', existingAdmin.role);
      
      // Reset password and ensure admin role
      existingAdmin.password = ADMIN_PASSWORD;
      existingAdmin.role = 'admin';
      existingAdmin.emailVerified = true;
      existingAdmin.isActive = true;
      existingAdmin.loginAttempts = 0;
      existingAdmin.lockUntil = undefined;
      await existingAdmin.save();
      
      console.log('✅ Admin password reset to: Admin@123456');
      console.log('✅ Account unlocked and activated');
      
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      fullName: 'LaraibCreative Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      phone: '+923038111297',
      whatsapp: '+923038111297',
      role: 'admin',
      emailVerified: true,
      isActive: true,
      addresses: []
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ' + ADMIN_EMAIL);
    console.log('🔑 Password: ' + ADMIN_PASSWORD);
    console.log('👤 Role:     admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
