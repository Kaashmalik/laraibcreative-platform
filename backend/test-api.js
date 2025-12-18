const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing backend API...\n');
    
    // Test 1: Get products
    const response = await axios.get('http://localhost:5000/api/v1/products', {
      params: { limit: 3 }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Total Products:', response.data.total);
    console.log('✅ Products Returned:', response.data.products?.length || 0);
    
    if (response.data.products && response.data.products.length > 0) {
      console.log('\n📦 Sample Product:');
      const product = response.data.products[0];
      console.log('  - Title:', product.title);
      console.log('  - isActive:', product.isActive);
      console.log('  - status:', product.status);
      console.log('  - Images:', product.images?.length || 0);
    }
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testAPI();
