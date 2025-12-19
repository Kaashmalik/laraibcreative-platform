require('dotenv').config();
console.log('PORT in env:', process.env.PORT);
console.log('MONGODB_URI in env:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');
