const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access API key from environment or fallback
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyC3YiBBTF7EMtFUeTOZdh7GiRPD3eJgg88");

const generateSummary = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Summarize the following text into 3-5 key phrases or tags separated by commas. Focus on industry, stage, key metrics, or value proposition. Keep it very brief suitable for a notification preview. Text: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();
        return summary;
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "New Interest Received"; // Fallback
    }
};

module.exports = { generateSummary };
