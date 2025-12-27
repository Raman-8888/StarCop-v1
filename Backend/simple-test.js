require('dotenv').config();
const { generateSummary } = require('./utils/gemini');

async function run() {
    const key = process.env.GEMINI_API_KEY;
    console.log("KEY_STATUS: " + (key ? "Present (" + key.substring(0, 5) + "...)" : "Missing"));

    const res = await generateSummary("test");
    console.log("RESULT: " + res);
}

run();
