const http = require('http');

const data = JSON.stringify({
    name: "Test User",
    username: "testuser_invalid_" + Date.now(),
    email: "test_invalid_" + Date.now() + "@example.com",
    password: "password123",
    accountType: "hacker" // Invalid enum
});

const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Response Body:', body);
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
