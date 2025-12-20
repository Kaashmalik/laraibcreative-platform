
const aiService = require('./src/services/aiService');
const logger = require('./src/utils/logger');

// Mocks
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test';

async function test() {
    console.log('--- Checking Configuration ---');
    const config = aiService.checkConfiguration();
    console.log(JSON.stringify(config, null, 2));

    console.log('\n--- Testing Connection ---');
    // We expect this might fail if keys are invalid, but it verifies the code path
    try {
        const result = await aiService.testConnection();
        console.log('Connection Result:', result);
    } catch (e) {
        console.log('Connection Failed (Expected if keys invalid):', e.message);
    }
}

test();
