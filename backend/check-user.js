require('dotenv').config();
// Try to apply DNS fix if available
try {
  require('./dns-fix');
} catch (e) {
  // DNS fix module not found, skipping...
}

const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const checkUser = async () => {
  try {
    const email = process.argv[2];
    if (!email) {
      console.error('Please provide an email address as an argument.');
      process.exit(1);
    }

    // Connect to Database
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

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
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log(`❌ User with email ${email} NOT FOUND in this database.`);
      console.log('This suggests the script is connecting to a different database than the one you expect.');
    } else {
        console.log(`✅ User found: ${user.fullName} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'MISSING'}`);
        
        // Test password
        const testPass = 'AdminPassword123!';
        const isMatch = await bcrypt.compare(testPass, user.password);
        console.log(`   Password 'AdminPassword123!' match: ${isMatch ? 'YES ✅' : 'NO ❌'}`);

        if (!isMatch) {
            console.log('   Resetting password to AdminPassword123! ...');
            user.password = testPass;
            await user.save();
            console.log('   ✅ Password reset successfully.');
        }
    }
    
    // Disconnect
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUser();
