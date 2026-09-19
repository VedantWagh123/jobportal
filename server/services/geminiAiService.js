import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import Job from '../models/Job.js';
import Course from '../models/Course.js';
import CurriculumAlert from '../models/CurriculumAlert.js';
import SystemSetting from '../models/SystemSetting.js';

// Helper to get dynamic configs
const getOllamaConfig = () => ({
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llava'
});

// Fallback helper for Ollama text generation
const callOllama = async (prompt) => {
    try {
        const { url, model } = getOllamaConfig();
        console.log(`[Ollama] Sending request to local model (${model})...`);
        const response = await axios.post(`${url}/api/generate`, {
            model: model,
            prompt: prompt,
            stream: false,
            keep_alive: "1h"
        }, { timeout: 15000 });
        return response.data.response;
    } catch (err) {
        console.error("[Ollama] Fallback also failed:", err.message);
        throw new Error("Both Gemini and Ollama failed.");
    }
};

// Fallback helper for Ollama chat generation
const callOllamaChat = async (contents) => {
    try {
        const { url, model } = getOllamaConfig();
        console.log(`[Ollama] Sending chat request to local model (${model})...`);
        // Convert Gemini contents array to Ollama messages array
        const messages = contents.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.parts.map(p => p.text).join('\n')
        }));
        
        const response = await axios.post(`${url}/api/chat`, {
            model: model,
            messages: messages,
            stream: false,
            keep_alive: "1h"
        }, { timeout: 20000 });
        return response.data.message.content;
    } catch (err) {
        let errorMsg = "OLLAMA_CONNECTION_FAILED";
        if (err.response && err.response.data && err.response.data.error) {
            errorMsg = err.response.data.error; // e.g. "model 'llama3' not found, try pulling it first"
        }
        console.error("[Ollama] Chat Fallback also failed:", err.message, "-", errorMsg);
        throw new Error(errorMsg);
    }
};

// Helper for managing multiple Gemini API keys and automatically switching if quota is exceeded
let currentGeminiKeyIndex = 0;

const executeGeminiWithFallback = async (executeWithKeyFn) => {
    const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2
    ].filter(Boolean);

    if (keys.length === 0) {
        throw new Error("No GEMINI_API_KEY provided in .env");
    }

    let attempts = 0;
    let lastError = null;

    // Loop through keys array twice at most to check if the first key refilled
    while (attempts < keys.length) {
        const keyToUse = keys[currentGeminiKeyIndex];
        console.log(`[Gemini API] Processing request using API Key ${currentGeminiKeyIndex + 1}...`);
        try {
            return await executeWithKeyFn(keyToUse);
        } catch (error) {
            lastError = error;
            console.warn(`[Gemini] Key ${currentGeminiKeyIndex + 1} failed: ${error.message}`);
            
            console.log(`[Gemini] Auto-switching to next available key...`);
            currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % keys.length;
            attempts++;
        }
    }

    throw new Error(`Gemini API Error: All ${keys.length} API keys exhausted their quotas. ` + (lastError?.message || ''));
};

export const runAIAnalysis = async () => {
    try {
        console.log("Starting AI Curriculum Gap Analysis...");
        
        // 1. Get Demand (All Jobs and their required skills)
        const jobs = await Job.find({ visible: true });
        const allRequestedSkills = jobs.reduce((acc, job) => acc.concat(job.skills || []), []);
        
        // Count frequency of skills in demand
        const skillDemand = {};
        allRequestedSkills.forEach(skill => {
            const s = skill.toLowerCase();
            skillDemand[s] = (skillDemand[s] || 0) + 1;
        });

        // 2. Get Supply (All Courses)
        const courses = await Course.find({ isActive: true });
        // Since courses don't have a specific 'skills' array yet, we'll send their names and descriptions
        const courseData = courses.map(c => ({ name: c.name, description: c.description }));

        // 3. Prepare Prompt for Gemini
        const prompt = `
        You are an AI Intelligence Engine for a Government Skill Development Portal.
        Your task is to identify URGENT MARKET SHORTAGES based on Job Market Demand (Skills required by companies).
        
        Job Market Demand (Skill Frequencies):
        ${JSON.stringify(skillDemand, null, 2)}
        
        Identify the top 3 most demanded skills in the job market right now.
        Even if courses exist for these skills, they are still considered "High Demand" because the industry urgently needs candidates who possess them.
        
        Respond ONLY with a valid JSON array of objects. Each object must have:
        - "skill": the name of the skill (e.g., "React")
        - "severity": "Medium", "High", or "Critical" (based on demand frequency)
        - "message": A short explanation (e.g., "High industry demand for React developers.")
        - "recommendedAction": A recommendation (e.g., "Candidates should urgently upskill in this area.")
        
        Output format exactly:
        [
            { "skill": "...", "severity": "...", "message": "...", "recommendedAction": "..." }
        ]
        `;

        // 4. Check Global Setting for Ollama Bypass
        let responseText = "";
        try {
            const settings = await SystemSetting.findOne();
            if (settings && settings.forceOllama) {
                console.log("[System] Force Ollama is ON. Bypassing Gemini...");
                throw new Error("Forced Ollama Bypass");
            }
            if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: prompt,
            });
            responseText = response.text;
        } catch (geminiError) {
            console.warn(`[Gemini] Failed (${geminiError.message}). Falling back to Ollama...`);
            responseText = await callOllama(prompt);
        }
        
        // Clean JSON string (remove markdown ticks if present)
        const jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const alerts = JSON.parse(jsonStr);

        // 5. Save Alerts to Database (Clear old active alerts first to avoid duplicates)
        await CurriculumAlert.deleteMany({ status: 'Active' });
        
        for (const alert of alerts) {
            await CurriculumAlert.create({
                skill: alert.skill,
                severity: alert.severity,
                message: alert.message,
                recommendedAction: alert.recommendedAction
            });
        }
        
        console.log(`AI Analysis Complete. Generated ${alerts.length} alerts.`);
        return { success: true, count: alerts.length };

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return { success: false, error: error.message };
    }
};

export const generateResponse = async (prompt, fallback = "") => {
    try {
        const settings = await SystemSetting.findOne();
        if (settings && settings.forceOllama) {
            console.log("[System] Force Ollama is ON. Bypassing Gemini...");
            return await callOllama(prompt);
        }
        if (!process.env.GEMINI_API_KEY) {
            console.warn("[Gemini] API Key missing. Falling back to Ollama.");
            return await callOllama(prompt);
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.warn(`[Gemini] API Error (${error.message}). Falling back to Ollama.`);
        try {
            return await callOllama(prompt);
        } catch (ollamaErr) {
            return fallback;
        }
    }
};

export const generateChatResponse = async (contents, fallback = "") => {
    try {
        const settings = await SystemSetting.findOne();
        if (settings && settings.forceOllama) {
            console.log("[System] Force Ollama is ON. Bypassing Gemini...");
            return await callOllamaChat(contents);
        }
        if (!process.env.GEMINI_API_KEY) {
            console.warn("[Gemini] API Key missing. Falling back to Ollama.");
            return await callOllamaChat(contents);
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: contents, // Array of { role: 'user'|'model', parts: [{text: '...'}] }
        });
        return response.text;
    } catch (error) {
        // If it was our forced Ollama bypass, it would have been caught or returned earlier.
        // But if callOllamaChat throws an error, it will be caught here.
        const { model } = getOllamaConfig();
        if (error.message === "OLLAMA_CONNECTION_FAILED" || error.code === 'ECONNREFUSED') {
            return `Ollama Connection Failed: Please ensure Ollama is running locally on port 11434 and the '${model}' model is installed.`;
        }
        if (error.message.includes("model") && error.message.includes("not found")) {
            return `Ollama Error: ${error.message}. Please open a terminal and run 'ollama run ${model}' to download the model.`;
        }

        console.warn(`[Gemini] Chat API Error (${error.message}). Falling back to Ollama.`);
        try {
            return await callOllamaChat(contents);
        } catch (ollamaErr) {
            if (ollamaErr.message && ollamaErr.message !== "OLLAMA_CONNECTION_FAILED") {
                return `Ollama Error: ${ollamaErr.message}`;
            }
            return `Ollama Connection Failed: Please ensure Ollama is running locally on port 11434 and the '${model}' model is installed.`;
        }
    }
};

export const extractSkillsFromResume = async (pdfText) => {
    try {
        const prompt = `You are a strict ATS (Applicant Tracking System) AI. 
Read the following text extracted from a candidate's resume.
Your ONLY task is to extract a list of standard technical skills, programming languages, databases, tools, and frameworks (e.g., React, Node.js, AWS, Python, SQL, Git).
CRITICAL RULES:
1. ONLY extract ACTUAL technical skills. DO NOT extract project names, domain descriptions, job titles, or phrases like "Web Development", "API Integration", or "Performance Improvements".
2. DO NOT extract soft skills (like communication, teamwork) or full sentences.
3. If it's a descriptive phrase (e.g. "AI-based Resume Analysis"), DO NOT include it.
4. Return ONLY a comma-separated list of skills, with no other text, no formatting, and no bullet points.

Example Output: "React, Node.js, AWS, Python, SQL, Agile"

Resume Text:
${pdfText.substring(0, 15000)}
`;

        let aiResponse = "";
        try {
            const settings = await SystemSetting.findOne();
            if (settings && settings.forceOllama) {
                console.log("[System] Force Ollama is ON. Bypassing Gemini...");
                throw new Error("Forced Ollama Bypass");
            }
            if (!process.env.GEMINI_API_KEY) {
                console.warn("[Gemini] API Key missing. Falling back to Ollama.");
                aiResponse = await callOllama(prompt);
            } else {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-3.6-flash',
                    contents: prompt,
                });
                aiResponse = response.text;
            }
        } catch (geminiError) {
            console.warn(`[Gemini] Resume parsing failed (${geminiError.message}). Falling back to Ollama...`);
            aiResponse = await callOllama(prompt);
        }
        
        if (!aiResponse || aiResponse.trim() === "") {
            return [];
        }

        // Clean up the response
        const skillsArray = aiResponse
            .split(',')
            .map(s => s.trim().replace(/['"]/g, ''))
            .filter(s => s.length > 0 && s.length <= 30);

        return skillsArray;
    } catch (error) {
        console.error("EXTRACT RESUME SKILLS ERROR:", error.message);
        return [];
    }
};

export const analyzeResumeForSmartMatch = async (pdfText) => {
    const prompt = `You are an expert AI Resume Analyzer for a SmartMatch ATS system.
Your task is to analyze the following resume text and extract the information into a strict JSON format.

CRITICAL RULES:
1. You MUST return ONLY valid JSON. Do not include markdown formatting like \`\`\`json or \`\`\`.
2. Do not include any conversational text.
3. If a section is missing from the resume, return an empty array or empty string for that field.

JSON Structure Requirements:
{
  "summary": "A brief professional summary based on the resume (max 2 sentences).",
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "experience": [
    {
      "jobTitle": "...",
      "company": "...",
      "years": 2, 
      "description": "..."
    }
  ],
  "education": [
    {
      "degree": "...",
      "institution": "...",
      "year": "..."
    }
  ],
  "certifications": ["cert1"]
}

Resume Text:
${pdfText.substring(0, 20000)}`;

    try {
        const aiResponseText = await executeGeminiWithFallback(async (apiKey) => {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });
            return response.text;
        });
        
        const jsonStr = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("SMARTMATCH RESUME ANALYSIS ERROR:", error.message);
        
        try {
            console.log("Attempting Ollama fallback for resume analysis...");
            const ollamaResponse = await callOllama(prompt);
            const jsonStr = ollamaResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (fallbackError) {
            console.error("Ollama fallback failed:", fallbackError.message);
            throw new Error("AI Services are unavailable (API Quotas Exceeded). Please start your local Ollama server in a terminal (run: 'ollama run llava') to continue offline.");
        }
    }
};

export const generateEmbedding = async (text) => {
    try {
        return await executeGeminiWithFallback(async (apiKey) => {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.embedContent({
                model: 'text-embedding-004',
                contents: text,
            });
            
            if (response.embeddings && response.embeddings.length > 0) {
                return response.embeddings[0].values;
            } else {
                throw new Error("No embedding returned");
            }
        });
        
    } catch (error) {
        console.error("Gemini Content Generation Error:", error.message);
        throw error;
    }
};

export const generateSkillGapRoadmap = async (missingSkills, jobTitle, candidateData) => {
    const fallbackRoadmap = {
        roadmap: missingSkills.map((s, i) => ({
            stepNumber: i + 1,
            skillName: s,
            estimatedDuration: "2-4 weeks",
            whyItMatters: `Required for the ${jobTitle} role.`,
            actionableAdvice: `Start by reading the official documentation and building a small project using ${s}.`
        })),
        encouragementMessage: "Keep pushing! Every new skill you learn opens up new opportunities."
    };

    try {
        const prompt = `You are an expert Career Coach and Skill Development Mentor.
A candidate is applying for the role of "${jobTitle}" but is missing the following required skills:
${missingSkills.join(", ")}

Their current profile summary:
${candidateData?.summary || "No summary provided."}

Please generate a realistic, actionable, step-by-step learning roadmap to help them acquire these missing skills.

CRITICAL RULES:
1. Return ONLY valid JSON. No markdown wrappers.
2. Structure the JSON exactly as follows:
{
  "roadmap": [
    {
      "stepNumber": 1,
      "skillName": "Name of the skill to focus on",
      "estimatedDuration": "e.g., 2 weeks, 1 month",
      "whyItMatters": "Brief 1-sentence reason why this is important for the role",
      "actionableAdvice": "1-2 sentences on how to start learning it"
    }
  ],
  "encouragementMessage": "A short, motivating message for the candidate."
}
3. The roadmap steps should be ordered logically (e.g. learn prerequisites first).`;
        const responseText = await executeGeminiWithFallback(async (apiKey) => {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });
            return response.text;
        });
        
        // Clean JSON formatting
        const cleanedResponseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        return JSON.parse(cleanedResponseText);

    } catch (error) {
        console.error("SmartMatch Skill Gap Roadmap Error:", error.message);
        console.log("Using fallback roadmap due to error.");
        return fallbackRoadmap;
    }
};
