
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/admin/ai/generate-complete',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
