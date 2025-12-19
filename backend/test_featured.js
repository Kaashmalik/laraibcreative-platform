const axios = require('axios');

async function testFeatured() {
    try {
        const url = 'http://localhost:5000/api/v1/products/featured';
        console.log(`Getting ${url}...`);
        const res = await axios.get(url, { params: { limit: 8 } });
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        if (err.response) {
            console.error('Error Status:', err.response.status);
            console.error('Error Data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}

testFeatured();
