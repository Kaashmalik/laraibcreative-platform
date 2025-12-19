const axios = require('axios');

async function testProducts() {
    try {
        const params = {
            page: 1,
            limit: 12,
            sortBy: 'newest',
            minPrice: 0,
            maxPrice: 50000
        };

        console.log('Requesting products from http://localhost:5001/api/v1/products...');
        const res = await axios.get('http://localhost:5001/api/v1/products', { params });

        console.log('Response Status:', res.status);
        console.log('Response Data Total:', res.data.total);
        console.log('Response Data Products Length:', res.data.products?.length);
        if (res.data.products && res.data.products.length > 0) {
            console.log('Sample Product Price:', res.data.products[0].pricing.basePrice);
        } else {
            console.log('NO PRODUCTS FOUND - CHECK FILTERING');
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error('Status:', error.response.status, 'Data:', JSON.stringify(error.response.data));
    }
}

testProducts();
