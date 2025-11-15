// minimal-server.js - Bare minimum to test
console.log('Starting minimal server...');

try {
  console.log('Step 1: Loading dotenv...');
  require('dotenv').config();
  console.log('✅ dotenv loaded');

  console.log('Step 2: Loading express...');
  const express = require('express');
  console.log('✅ express loaded');

  console.log('Step 3: Loading mongoose...');
  const mongoose = require('mongoose');
  console.log('✅ mongoose loaded');

  console.log('Step 4: Creating express app...');
  const app = express();
  console.log('✅ app created');

  console.log('Step 5: Setting up middleware...');
  app.use(express.json());
  console.log('✅ middleware configured');

  console.log('Step 6: Creating health route...');
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Minimal server is running' });
  });
  console.log('✅ route created');

  console.log('Step 7: Checking environment variables...');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'MISSING');
  console.log('PORT:', process.env.PORT || 5000);

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing!');
    console.error('Create a .env file with:');
    console.error('MONGODB_URI=your_connection_string');
    process.exit(1);
  }

  console.log('Step 8: Connecting to MongoDB...');
  console.log('⏳ If cluster is paused, it will auto-resume (wait 30-60 seconds)...\n');
  
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 60000, // 60 seconds for auto-resume
    connectTimeoutMS: 60000,
    family: 4
  })
    .then(() => {
      console.log('✅ MongoDB connected');
      
      console.log('Step 9: Starting server...');
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`Test it: http://localhost:${PORT}/health`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:');
      console.error(err.message);
      process.exit(1);
    });

} catch (err) {
  console.error('❌ FATAL ERROR:');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('\nFull stack trace:');
  console.error(err.stack);
  process.exit(1);
}