const http = require('http');

const username = 'testuser'; 
async function run() {
    // 1. Signup a user to ensure we have one
    const uniqueName = 'user' + Date.now();
    const headers = { 'Content-Type': 'application/json' };

    

    const signupData = JSON.stringify({
        name: 'Test User',
        username: uniqueName,
        email: `${uniqueName}@example.com`,
        password: 'password123',
        accountType: 'startup'
    });

    const signupReq = http.request({
        hostname: 'localhost',
        port: 3002,
        path: '/api/auth/signup',
        method: 'POST',
        headers: {
            ...headers,
            'Content-Length': signupData.length
        }
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Signup Status:', res.statusCode);
            console.log('Signup Body:', data);

            if (res.statusCode === 201) {
                // Now fetch profile
                fetchProfile(uniqueName);
            }
        });
    });

    signupReq.write(signupData);
    signupReq.end();
}

function fetchProfile(username) {
    http.get(`http://localhost:3002/api/users/${username}`, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Profile Status:', res.statusCode);
            console.log('Profile Body:', data);
        });
    }).on('error', (err) => {
        console.error('Profile Error:', err.message);
    });
}

run();
