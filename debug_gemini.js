
import { GoogleGenerativeAI } from '@google/generative-ai';

// Hardcoded for debugging purposes to bypass dotenv issues
const apiKey = "AIzaSyDsU8-3bIuLu7DHqj4FkIcUlmQvRC48R4E";

console.log(`Checking models...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const modelsToTry = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-1.0-pro-latest',
            'gemini-1.5-flash-latest'
        ];

        console.log("Testing available models...");

        for (const modelName of modelsToTry) {
            process.stdout.write(`Trying ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                const response = await result.response;
                console.log(`✅ SUCCESS!`);
                return;
            } catch (error) {
                console.log(`❌ FAILED`);
            }
        }

        console.log("All attempted models failed.");

    } catch (e) {
        console.error("Fatal error:", e);
    }
}

listModels();
