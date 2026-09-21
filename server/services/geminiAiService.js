import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import Job from '../models/Job.js';
import Course from '../models/Course.js';
import CurriculumAlert from '../models/CurriculumAlert.js';
import SystemSetting from '../models/SystemSetting.js';
import AiUsageLog from '../models/AiUsageLog.js';
import { getIO } from '../config/socket.js';

// ============================================================
// MODEL POOL — rotates across models on quota exhaustion
// 2 keys × 5 models × 20 free RPD = 200 requests/day total
// ============================================================
const GEMINI_MODELS = [
    'gemini-3.6-flash',  // Primary — verified working
    'gemini-2.5-flash',  // Fallback 1
    'gemini-3.5-flash',  // Fallback 2
    'gemini-3.7-flash',  // Fallback 3
    'gemini-3.1-flash-lite', // Fallback 4 — lighter/cheaper
];

// Keep GEMINI_MODEL alias for logging/error display
const GEMINI_MODEL = GEMINI_MODELS[0];

// ============================================================
// CACHED SYSTEM SETTINGS (refresh every 60 seconds)
// Avoids repeated DB queries on every AI call
// ============================================================
let _settingsCache = null;
let _settingsCacheTime = 0;
const SETTINGS_TTL_MS = 60000; // 60 seconds

const getSettings = async () => {
    const now = Date.now();
    if (_settingsCache && (now - _settingsCacheTime) < SETTINGS_TTL_MS) {
        return _settingsCache;
    }
    try {
        _settingsCache = await SystemSetting.findOne().lean();
        _settingsCacheTime = now;
    } catch (e) {
        // If DB not ready yet, return null (no forced Ollama)
        console.warn('[Settings] Could not load SystemSetting, defaulting to Gemini mode.');
        return null;
    }
    return _settingsCache;
};

// Invalidate cache when settings are changed (exported so other modules can call it)
export const invalidateSettingsCache = () => { _settingsCache = null; };

// ============================================================
// LOG AI USAGE + EMIT SOCKET EVENT
// ============================================================
const logUsage = async (feature, prompt, options = {}) => {
    try {
        let promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
        const {
            start = Date.now(),
            status = 'success',
            provider = 'Google Gemini',
            modelUsed = 'gemini-3.6-flash',
            keyChannel = 'Unknown',
            inputTokens = 0,
            outputTokens = 0,
            totalTokens = 0,
            errorCode = null,
            errorMessage = null,
            fallbackUsed = false,
            source = 'System'
        } = options;
        
        const durationMs = Date.now() - start;
        const newLog = await AiUsageLog.create({
            feature,
            promptPreview: promptText ? promptText.substring(0, 500) : '',
            provider,
            modelUsed,
            keyChannel,
            status,
            durationMs,
            inputTokens,
            outputTokens,
            totalTokens,
            errorCode,
            errorMessage,
            fallbackUsed,
            source
        });
        try {
            getIO().emit('ai_usage_updated', newLog);
        } catch (_) { /* socket not ready, ignore */ }
    } catch (e) {
        console.error("Failed to log AI usage:", e.message);
    }
};

// ============================================================
// OLLAMA FALLBACK HELPERS
// ============================================================
const getOllamaConfig = () => ({
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llava'
});

const callOllama = async (prompt) => {
    try {
        const { url, model } = getOllamaConfig();
        console.log(`[Ollama] Sending request to local model (${model})...`);
        const response = await axios.post(`${url}/api/generate`, {
            model, prompt, stream: false, keep_alive: "1h"
        }, { timeout: 15000 });
        return response.data.response;
    } catch (err) {
        console.error("[Ollama] Fallback also failed:", err.message);
        throw new Error("Both Gemini and Ollama failed.");
    }
};

const callOllamaChat = async (contents) => {
    try {
        const { url, model } = getOllamaConfig();
        console.log(`[Ollama] Sending chat request to local model (${model})...`);
        const messages = contents.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.parts.map(p => p.text).join('\n')
        }));
        const response = await axios.post(`${url}/api/chat`, {
            model, messages, stream: false, keep_alive: "1h"
        }, { timeout: 20000 });
        return response.data.message.content;
    } catch (err) {
        let errorMsg = "OLLAMA_CONNECTION_FAILED";
        if (err.response?.data?.error) {
            errorMsg = err.response.data.error;
        }
        console.error("[Ollama] Chat Fallback also failed:", err.message, "-", errorMsg);
        throw new Error(errorMsg);
    }
};

// ============================================================
// GEMINI ERROR ANALYZER — Prints root cause clearly in terminal
// ============================================================
const analyzeGeminiError = (error, keyIndex, attempt) => {
    // Extract the most useful error info from different error shapes
    const statusCode  = error?.status || error?.response?.status || error?.code || 'UNKNOWN';
    const rawMsg      = error?.message || String(error);
    const details     = error?.errorDetails || error?.response?.data?.error || null;

    // Classify the error
    let category = 'UNKNOWN';
    let suggestion = '';

    if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota') || statusCode === 429) {
        category = 'QUOTA_EXHAUSTED';
        suggestion = 'Daily/minute quota exceeded. Auto-switching to next API key.';
    } else if (rawMsg.includes('404') || rawMsg.includes('not found') || rawMsg.includes('not supported')) {
        category = 'MODEL_NOT_FOUND';
        suggestion = `Model name is invalid or not accessible with this API key. Model used: ${GEMINI_MODEL}`;
    } else if (rawMsg.includes('403') || rawMsg.includes('PERMISSION_DENIED') || rawMsg.includes('API key not valid')) {
        category = 'INVALID_API_KEY';
        suggestion = 'API key is invalid or does not have permission to use this model.';
    } else if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('overloaded')) {
        category = 'SERVICE_OVERLOADED';
        suggestion = 'Gemini servers are overloaded / high demand. Will retry with next key.';
    } else if (rawMsg.includes('401') || rawMsg.includes('UNAUTHENTICATED')) {
        category = 'AUTH_FAILED';
        suggestion = 'Authentication failed — check that the API key is correctly set in .env';
    } else if (rawMsg.includes('ECONNREFUSED') || rawMsg.includes('ENOTFOUND') || rawMsg.includes('network')) {
        category = 'NETWORK_ERROR';
        suggestion = 'Cannot reach Google servers. Check your internet connection.';
    } else if (rawMsg.includes('500') || rawMsg.includes('INTERNAL')) {
        category = 'GEMINI_SERVER_ERROR';
        suggestion = 'Internal error on Google servers. Not your fault — retrying.';
    } else if (rawMsg.includes('timeout') || rawMsg.includes('DEADLINE_EXCEEDED')) {
        category = 'TIMEOUT';
        suggestion = 'Request timed out. Gemini is slow or prompt is too large.';
    }

    // Print a rich, readable error box
    const sep = '─'.repeat(60);
    console.error(`\n\x1b[31m┌${sep}┐\x1b[0m`);
    console.error(`\x1b[31m│  🔴 GEMINI API ERROR  (Key ${keyIndex + 1}, Attempt ${attempt + 1})\x1b[0m`);
    console.error(`\x1b[31m├${sep}┤\x1b[0m`);
    console.error(`\x1b[33m│  Category   :\x1b[0m ${category}`);
    console.error(`\x1b[33m│  HTTP Code  :\x1b[0m ${statusCode}`);
    console.error(`\x1b[33m│  Model      :\x1b[0m ${GEMINI_MODEL}`);
    console.error(`\x1b[33m│  Raw Error  :\x1b[0m ${rawMsg.substring(0, 200)}`);
    if (details) {
        console.error(`\x1b[33m│  Details    :\x1b[0m ${JSON.stringify(details).substring(0, 200)}`);
    }
    console.error(`\x1b[36m│  Suggestion :\x1b[0m ${suggestion || 'Unknown error — check logs above.'}`);
    console.error(`\x1b[31m└${sep}┘\x1b[0m\n`);

    return category;
};

// ============================================================
// CENTRAL MULTI-KEY + MULTI-MODEL FALLBACK EXECUTOR
// Builds a pool of [key1+model1, key1+model2, key2+model1, ...]
// Rotates through ALL combos before giving up.
// ============================================================
let currentComboIndex = 0;

const executeGeminiWithFallback = async (executeFn) => {
    const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2
    ].filter(Boolean);

    if (keys.length === 0) {
        console.error('\x1b[31m[Gemini] FATAL: No API keys in .env!\x1b[0m');
        throw new Error("No GEMINI_API_KEY provided in .env");
    }

    // Build all (key, model) combos: key1+model1, key2+model1, key1+model2, key2+model2...
    // Interleave keys per model so both keys share the load equally
    const combos = [];
    for (const model of GEMINI_MODELS) {
        for (const key of keys) {
            combos.push({ key, model });
        }
    }

    const totalCombos = combos.length;
    let lastError = null;
    let lastCategory = '';

    for (let attempt = 0; attempt < totalCombos; attempt++) {
        const { key: keyToUse, model: modelToUse } = combos[currentComboIndex % totalCombos];
        console.log(`\x1b[36m[Gemini]\x1b[0m Combo ${currentComboIndex % totalCombos + 1}/${totalCombos} — Model: ${modelToUse}, Key: ...${keyToUse.slice(-6)}`);

        try {
            const result = await executeFn(keyToUse, modelToUse);
            console.log(`\x1b[32m[Gemini] ✓ Success — Model: ${modelToUse}, Key: ...${keyToUse.slice(-6)}\x1b[0m`);
            return {
                response: result,
                _telemetry: {
                    keyChannel: keyToUse === process.env.GEMINI_API_KEY ? 'Primary Key' : 'Fallback Key',
                    modelUsed: modelToUse,
                    provider: 'Google Gemini'
                }
            };
        } catch (error) {
            lastError = error;
            lastCategory = analyzeGeminiError(error, currentComboIndex % totalCombos, attempt, modelToUse);

            // Only advance combo on quota/auth errors — retry same combo on transient errors
            if (['QUOTA_EXHAUSTED', 'MODEL_NOT_FOUND', 'INVALID_API_KEY'].includes(lastCategory)) {
                currentComboIndex++;
                const next = combos[currentComboIndex % totalCombos];
                if (attempt + 1 < totalCombos) {
                    console.warn(`\x1b[33m[Gemini] Quota exhausted on ${modelToUse}. Switching to Model: ${next.model}, Key: ...${next.key.slice(-6)}\x1b[0m`);
                }
            } else {
                // Transient error (overload, timeout) — just advance
                currentComboIndex++;
                if (attempt + 1 < totalCombos) {
                    const next = combos[currentComboIndex % totalCombos];
                    console.warn(`\x1b[33m[Gemini] Transient error. Retrying with Model: ${next.model}\x1b[0m`);
                }
            }
        }
    }

    console.error(`\x1b[31m[Gemini] ALL ${totalCombos} combos exhausted (${keys.length} keys × ${GEMINI_MODELS.length} models). Last: ${lastCategory}. Attempting Ollama fallback.\x1b[0m`);
    throw new Error(`All Gemini combos failed [${lastCategory}]: ${lastError?.message || 'unknown'}`);
};

// ============================================================
// runAIAnalysis - Curriculum Gap (uses KEY_1 directly, low freq)
// ============================================================
export const runAIAnalysis = async () => {
    try {
        console.log("Starting AI Curriculum Gap Analysis...");
        const jobs = await Job.find({ visible: true });
        const allRequestedSkills = jobs.reduce((acc, job) => acc.concat(job.skills || []), []);
        const skillDemand = {};
        allRequestedSkills.forEach(skill => {
            const s = skill.toLowerCase();
            skillDemand[s] = (skillDemand[s] || 0) + 1;
        });

        const courses = await Course.find({ isActive: true });
        const courseData = courses.map(c => ({ name: c.name, description: c.description }));

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

        let responseText = "";
        try {
            const settings = await getSettings();
            if (settings && settings.forceOllama) {
                throw new Error("Forced Ollama Bypass");
            }
            const start = Date.now();
            const { response, _telemetry } = await executeGeminiWithFallback(async (apiKey, model) => {
                const ai = new GoogleGenAI({ apiKey });
                return await ai.models.generateContent({ model: model, contents: prompt });
            });
            responseText = response.text;
            await logUsage('Curriculum Gap Analysis', prompt, {
                start,
                status: 'success',
                ..._telemetry,
                inputTokens: response.usageMetadata?.promptTokenCount || 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
                totalTokens: response.usageMetadata?.totalTokenCount || 0
            });
        } catch (geminiError) {
            console.warn(`[Gemini] runAIAnalysis failed (${geminiError.message}). Falling back to Ollama...`);
            responseText = await callOllama(prompt);
        }

        const jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const alerts = JSON.parse(jsonStr);

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

// ============================================================
// generateResponse - Smart Assistant general responses
// ============================================================
export const generateResponse = async (prompt, fallback = "") => {
    const start = Date.now();
    try {
        const settings = await getSettings();
        if (settings && settings.forceOllama) {
            console.log("[System] Force Ollama is ON. Bypassing Gemini...");
            const res = await callOllama(prompt);
            await logUsage('General AI Response (Ollama)', prompt, { start, status: 'success', fallbackUsed: true, provider: 'Ollama' });
            return res;
        }
        const { response, _telemetry } = await executeGeminiWithFallback(async (apiKey, model) => {
            const ai = new GoogleGenAI({ apiKey });
            return await ai.models.generateContent({ model: model, contents: prompt });
        });
        const responseText = response.text;
        await logUsage('General AI Response', prompt, {
            start,
            status: 'success',
            ..._telemetry,
            inputTokens: response.usageMetadata?.promptTokenCount || 0,
            outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata?.totalTokenCount || 0
        });
        return responseText;
    } catch (error) {
        console.warn(`[Gemini] generateResponse failed (${error.message}). Falling back to Ollama.`);
        try {
            const res = await callOllama(prompt);
            await logUsage('General AI Response (Ollama)', prompt, { start, status: 'success', fallbackUsed: true, provider: 'Ollama' });
            return res;
        } catch (ollamaErr) {
            await logUsage('General AI Response', prompt, { start, status: 'error', errorMessage: error.message });
            return fallback;
        }
    }
};

// ============================================================
// generateChatResponse - Smart Assistant chat history
// ============================================================
export const generateChatResponse = async (contents, fallback = "") => {
    try {
        const settings = await getSettings();
        if (settings && settings.forceOllama) {
            console.log("[System] Force Ollama is ON. Bypassing Gemini...");
            return await callOllamaChat(contents);
        }
        const start = Date.now();
        const { response, _telemetry } = await executeGeminiWithFallback(async (apiKey, model) => {
            const ai = new GoogleGenAI({ apiKey });
            return await ai.models.generateContent({
                model: model,
                contents: contents
            });
        });
        const responseText = response.text;
        await logUsage('Smart Assistant Chat', JSON.stringify(contents), {
            start,
            status: 'success',
            ..._telemetry,
            inputTokens: response.usageMetadata?.promptTokenCount || 0,
            outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata?.totalTokenCount || 0
        });
        return responseText;
    } catch (error) {
        const { model } = getOllamaConfig();
        if (error.message === "OLLAMA_CONNECTION_FAILED" || error.code === 'ECONNREFUSED') {
            return `Ollama Connection Failed: Please ensure Ollama is running locally on port 11434 and the '${model}' model is installed.`;
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

// ============================================================
// extractSkillsFromResume
// ============================================================
export const extractSkillsFromResume = async (pdfText) => {
    const start = Date.now();
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
        const settings = await getSettings();
        if (settings && settings.forceOllama) {
            console.log("[System] Force Ollama is ON. Bypassing Gemini...");
            aiResponse = await callOllama(prompt);
            await logUsage('Extract Skills', prompt, { start, status: 'success', fallbackUsed: true, provider: 'Ollama' });
        } else {
            try {
                const { response, _telemetry } = await executeGeminiWithFallback(async (apiKey, model) => {
                    const ai = new GoogleGenAI({ apiKey });
                    return await ai.models.generateContent({ model: model, contents: prompt });
                });
                aiResponse = response.text;
                await logUsage('Extract Skills', prompt, {
                    start,
                    status: 'success',
                    ..._telemetry,
                    inputTokens: response.usageMetadata?.promptTokenCount || 0,
                    outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: response.usageMetadata?.totalTokenCount || 0
                });
            } catch (geminiError) {
                console.warn(`[Gemini] extractSkillsFromResume failed (${geminiError.message}). Falling back to Ollama...`);
                aiResponse = await callOllama(prompt);
                await logUsage('Extract Skills (Ollama)', prompt, { start, status: 'success', fallbackUsed: true, provider: 'Ollama' });
            }
        }

        if (!aiResponse || aiResponse.trim() === "") return [];

        const skillsArray = aiResponse
            .split(',')
            .map(s => s.trim().replace(/['"]/g, ''))
            .filter(s => s.length > 0 && s.length <= 30);

        return skillsArray;
    } catch (error) {
        console.error("EXTRACT RESUME SKILLS ERROR:", error.message);
        await logUsage('Extract Skills', 'Error', { start, status: 'error', errorMessage: error.message });
        return [];
    }
};

// ============================================================
// analyzeResumeForSmartMatch
// ============================================================
export const analyzeResumeForSmartMatch = async (pdfText) => {
    const start = Date.now();
    const prompt = `You are an expert AI Resume Analyzer for a SmartMatch ATS system.
Your task is to analyze the following text and determine if it is a resume. A valid resume typically contains sections like Professional Summary, Skills, Experience, or Education.

CRITICAL RULES:
1. You MUST return ONLY valid JSON. Do not include markdown formatting like \`\`\`json or \`\`\`.
2. Do not include any conversational text.
3. If the text is CLEARLY NOT a resume (e.g., it is an offer letter, a random article, a receipt, or general text), you MUST return EXACTLY this JSON: {"isResume": false}.
4. If it IS a resume, extract the information into the following strict JSON format:
{
  "isResume": true,
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
        const { response, _telemetry } = await executeGeminiWithFallback(async (apiKey, model) => {
            const ai = new GoogleGenAI({ apiKey });
            return await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
        });

        const jsonStr = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        await logUsage('SmartMatch Resume Analysis', prompt, {
            start,
            status: 'success',
            ..._telemetry,
            inputTokens: response.usageMetadata?.promptTokenCount || 0,
            outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata?.totalTokenCount || 0
        });
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("SMARTMATCH RESUME ANALYSIS ERROR:", error.message);
        try {
            console.log("Attempting Ollama fallback for resume analysis...");
            const ollamaResponse = await callOllama(prompt);
            const jsonStr = ollamaResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            await logUsage('SmartMatch Resume Analysis (Ollama)', prompt, { start, status: 'success', fallbackUsed: true, provider: 'Ollama' });
            return JSON.parse(jsonStr);
        } catch (fallbackError) {
            console.error("Ollama fallback failed:", fallbackError.message);
            await logUsage('SmartMatch Resume Analysis', prompt, { start, status: 'error', errorMessage: fallbackError.message });
            throw new Error("AI Services are unavailable. Please try again shortly.");
        }
    }
};

// ============================================================
// generateEmbedding
// ============================================================
export const generateEmbedding = async (text) => {
    try {
        const start = Date.now();
        const { response, _telemetry } = await executeGeminiWithFallback(async (apiKey, model) => {
            const ai = new GoogleGenAI({ apiKey });
            return await ai.models.embedContent({
                model: 'gemini-embedding-2',
                contents: text,
            });
        });
        
        await logUsage('Generate Embedding', text, {
            start,
            status: 'success',
            ..._telemetry
        });

        if (response.embeddings && response.embeddings.length > 0) {
                return response.embeddings[0].values;
            } else {
                throw new Error("No embedding returned");
            }
    } catch (error) {
        console.error("Gemini Embedding Error:", error.message);
        throw error;
    }
};

// ============================================================
// generateSkillGapRoadmap
// ============================================================
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

        const start = Date.now();
        const { response, _telemetry } = await executeGeminiWithFallback(async (apiKey, model) => {
            const ai = new GoogleGenAI({ apiKey });
            return await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
        });

        const cleanedResponseText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        await logUsage('Generate Skill Gap Roadmap', prompt, {
            start,
            status: 'success',
            ..._telemetry,
            inputTokens: response.usageMetadata?.promptTokenCount || 0,
            outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata?.totalTokenCount || 0
        });
        return JSON.parse(cleanedResponseText);
    } catch (error) {
        console.error("SmartMatch Skill Gap Roadmap Error:", error.message);
        console.log("Using fallback roadmap due to error.");
        return fallbackRoadmap;
    }
};



