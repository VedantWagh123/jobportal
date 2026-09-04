import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const testGemini = async () => {
    try {
        console.log("Testing Gemini API Key...");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Say "hello world" if the API key works.'
        });
        console.log("Success! API Response:", response.text);
    } catch (error) {
        console.error("Failed to connect to Gemini API:", error.message);
    }
};

testGemini();
