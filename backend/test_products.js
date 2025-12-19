const axios = require('axios');

async function testProducts() {
    try {
        const url = 'http://127.0.0.1:5000/api/v1/products';
        console.log(`Getting ${url}...`);

        // Simulate default frontend params
        const params = {
            page: 1,
            limit: 12,
            sortBy: 'newest'
        };

        const res = await axios.get(url, { params });
        console.log('Status:', res.status);
        console.log('Success:', res.data.success);
        console.log('Total:', res.data.total);
        console.log('Products Count:', res.data.products?.length);
        console.log('Facets Keys:', Object.keys(res.data.facets || {}));

        if (res.data.products?.length > 0) {
            console.log('Sample Product[0]:', res.data.products[0].title);
        } else {
            console.log('WARN: No products returned!');
            console.log('Full Response:', JSON.stringify(res.data, null, 2));
        }

    } catch (err) {
        if (err.response) {
            console.error('Error Status:', err.response.status);
            console.error('Error Data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}

testProducts();
