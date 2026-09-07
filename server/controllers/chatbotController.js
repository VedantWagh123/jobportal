import { GoogleGenAI } from '@google/genai';

export const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Construct the prompt with history
        let promptContext = `You are a helpful Career and Job Assistant AI for SkillSet India. 
You help students find jobs, improve their skills, and navigate their career path.
Keep your answers concise, friendly, and structured. 
Do not use markdown headers unless necessary, keep it conversational.

`;

        if (history && history.length > 0) {
            promptContext += "Previous Conversation:\n";
            history.forEach(msg => {
                promptContext += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
            });
            promptContext += "\n";
        }

        promptContext += `User: ${message}\nAssistant:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptContext,
        });

        res.json({ success: true, response: response.text });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate AI response" });
    }
};
