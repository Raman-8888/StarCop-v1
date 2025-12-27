const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access API key from environment or fallback
const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_api || "AIzaSyC3YiBBTF7EMtFUeTOZdh7GiRPD3eJgg88";
const genAI = new GoogleGenerativeAI(apiKey);

const generateSummary = async (text) => {
    const prompt = `Summarize the following text into 3-5 key phrases or tags separated by commas. Focus on industry, stage, key metrics, or value proposition. Keep it very brief suitable for a notification preview. Text: "${text}"`;

    try {
        // Primary Model
        console.log("Attempting summary with gemini-2.5-flash-lite...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (primaryError) {
        console.warn("Primary model failed:", primaryError.message);

        try {
            // Fallback Model
            console.log("Attempting fallback with gemini-1.5-flash...");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (fallbackError) {
            console.error("All models failed. Primary:", primaryError.message, "Fallback:", fallbackError.message);
            return "New Interest Received";
        }
    }
};

module.exports = { generateSummary };
