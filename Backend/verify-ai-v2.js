const dotenvResult = require('dotenv').config();
const fs = require('fs');

async function debugEnv() {
    let output = "";
    if (dotenvResult.error) {
        output += "Dotenv Error: " + dotenvResult.error.message + "\n";
    } else {
        output += "Dotenv Parsed Keys: " + Object.keys(dotenvResult.parsed).join(", ") + "\n";
    }

    const key = process.env.GEMINI_API_KEY;
    output += "Final GEMINI_API_KEY: " + (key ? key.substring(0, 5) + "..." : "UNDEFINED") + "\n";

    fs.writeFileSync('env_debug.txt', output);
}

debugEnv();
