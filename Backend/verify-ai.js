require('dotenv').config();
const { generateSummary } = require('./utils/gemini');
const fs = require('fs');

async function verify() {
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync('error_log.txt', msg + '\n');
    };

    fs.writeFileSync('error_log.txt', '--- START LOG ---\n');
    log("Verifying AI Summary...");

    try {
        const result = await generateSummary("Test input string for summary.");
        log("Result: " + result);
    } catch (e) {
        log("CRASH: " + e.message);
    }
}

verify();
