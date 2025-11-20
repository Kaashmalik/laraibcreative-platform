require('dotenv').config();
// Try to apply DNS fix if available
try {
  require('../dns-fix');
} catch (e) {
  // DNS fix module not found, skipping...
}

const mongoose = require('mongoose');
const User = require('../src/models/User');

const makeAdmin = async () => {
  try {
    // Check for email argument
    const email = process.argv[2];
    if (!email) {
      console.error('Please provide an email address as an argument.');
      console.log('Usage: node scripts/make-admin.js <email>');
      process.exit(1);
    }

    // Connect to Database
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Clean URI: Remove replicaSet param to avoid conflicts if topology changed
    let uri = process.env.MONGODB_URI;
    if (uri.includes('replicaSet=')) {
        console.log('Removing replicaSet param from URI for robustness...');
        uri = uri.replace(/&?replicaSet=[^&]+/, '');
    }

    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
    });
    console.log('Connected to MongoDB');

    // Find user
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`User with email ${email} not found.`);
      console.log('Creating new admin user...');
      
      try {
        user = await User.create({
            fullName: 'Admin User',
            email: email.toLowerCase(),
            password: 'AdminPassword123!',
            phone: '+923000000000', // Dummy valid phone
            role: 'admin',
            emailVerified: true
        });
        console.log('✅ Created new admin user!');
        console.log('📧 Email:', email);
        console.log('🔑 Password: AdminPassword123!');
        console.log('📱 Phone: +923000000000');
        console.log('⚠️  Please change your password immediately after logging in.');
      } catch (createError) {
        console.error('Failed to create user:', createError.message);
        if (createError.errors) {
            Object.keys(createError.errors).forEach(key => {
                console.error(`- ${key}: ${createError.errors[key].message}`);
            });
        }
        process.exit(1);
      }
    } else {
        // Update role
        user.role = 'admin';
        await user.save();
        console.log(`Successfully updated user ${user.fullName} (${user.email}) to admin role.`);
    }
    
    // Disconnect
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.name === 'MongooseServerSelectionError') {
        console.error('\nPossible causes:');
        console.error('1. Your IP address is not whitelisted in MongoDB Atlas.');
        console.error('2. Internet connection issues.');
        console.error('3. Incorrect MongoDB URI.');
    }
    process.exit(1);
  }
};

makeAdmin();
