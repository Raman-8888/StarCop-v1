require('dotenv').config();
const { generateSummary } = require('./utils/gemini');
const fs = require('fs');

async function testModel() {
    console.log("Testing with gemini-pro...");
    try {
        const res = await generateSummary("Startup test description.");
        console.log("RESULT: " + res);
        fs.writeFileSync('model_test_result.txt', res);
    } catch (e) {
        console.log("ERROR: " + e.message);
        fs.writeFileSync('model_test_result.txt', "ERROR: " + e.message);
    }
}

testModel();
