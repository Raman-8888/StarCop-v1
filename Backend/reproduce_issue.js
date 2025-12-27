const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config();

const API_PORT = 5000;
const API_HOST = 'localhost';

function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ data: parsed, status: res.statusCode });
                    } else {
                        reject(new Error(parsed.message || res.statusMessage));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

const User = require('./models/usermodel');
const Opportunity = require('./models/opportunity.model');

async function run() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/startup_connect');
    console.log('DB Connected');

    // Clean up previous test data
    await User.deleteMany({ email: { $in: ['test_inv3@test.com', 'test_start3@test.com'] } });
    await Opportunity.deleteMany({ title: 'Test Opportunity 3' });

    try {
        // 1. Register Investor
        console.log('Registering Investor...');
        const invRes = await request('POST', '/auth/signup', {
            name: 'Test Investor 3',
            email: 'test_inv3@test.com',
            password: 'password123',
            accountType: 'investor'
        });
        const invToken = invRes.data.token;
        console.log('Investor Registered.');

        // 2. Register Startup
        console.log('Registering Startup...');
        const startRes = await request('POST', '/auth/signup', {
            name: 'Test Startup 3',
            email: 'test_start3@test.com',
            password: 'password123',
            accountType: 'startup'
        });
        const startToken = startRes.data.token;
        console.log('Startup Registered.');

        // 3. Investor Create Opportunity
        console.log('Creating Opportunity...');
        const oppRes = await request('POST', '/opportunities', {
            title: 'Test Opportunity 3',
            industry: 'Tech',
            problem: 'Problem',
            solution: 'Solution',
            description: 'Desc',
            visibility: true
        }, { Authorization: `Bearer ${invToken}` });
        const oppId = oppRes.data._id;
        console.log('Opportunity Created:', oppId);

        // 4. Startup Send Interest
        console.log('Sending Interest...');
        const intRes = await request('POST', `/opportunities/${oppId}/interest`, {
            message: 'I am interested'
        }, { Authorization: `Bearer ${startToken}` });
        console.log('Interest Sent:', intRes.data._id);

        // 5. Check Investor Dashboard (Incoming Interests)
        console.log('Checking Investor Dashboard (my-interests)...');
        const dashRes = await request('GET', '/opportunities/startup/my-interests', null, { Authorization: `Bearer ${invToken}` });

        console.log('Investor Dashboard Response Length:', dashRes.data.length);
        if (dashRes.data.length > 0) {
            console.log('SUCCESS: Interest found!');
            console.log('Recipient in DB:', dashRes.data[0].recipient);

            // Verify Sender Logic
            const interest = dashRes.data[0];
            const displaySender = interest.sender;
            console.log('Frontend Sender Name:', displaySender?.name);
            console.log('Frontend Message:', interest.message);
        } else {
            console.log('FAILURE: Interest NOT found in dashboard.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        mongoose.disconnect();
    }
}

run();
