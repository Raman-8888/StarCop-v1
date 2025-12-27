require('dotenv').config();
const { generateSummary } = require('./utils/gemini');

async function testSummary() {
    console.log("Testing Gemini AI Summary...");
    const sampleText = "We are a fintech startup causing disruption in the payments industry using blockchain. We have 10k users and $1M ARR. Looking for Seed funding of $2M.";

    try {
        const summary = await generateSummary(sampleText);
        console.log("\n--- Input Text ---");
        console.log(sampleText);
        console.log("\n--- Generated Summary ---");
        console.log(summary);

        if (summary === "New Interest Received") {
            console.log("\n[FAIL] Fallback returned. Check API Key or Quota.");
        } else {
            console.log("\n[SUCCESS] AI Summary generated.");
        }
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testSummary();
