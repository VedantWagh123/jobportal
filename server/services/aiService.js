import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import Skill from "../models/Skill.js";
import JobSkill from "../models/JobSkill.js";
import UnresolvedSkill from "../models/UnresolvedSkill.js";
import Job from "../models/Job.js";
import JobIntelligence from "../models/JobIntelligence.js";
import SystemSetting from '../models/SystemSetting.js';

// Helper to get dynamic configs
const getOllamaConfig = () => ({
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llava'
});

// MODEL POOL — rotates across models on quota exhaustion
const GEMINI_MODELS = [
    'gemini-3.6-flash',
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
];
const GEMINI_MODEL = GEMINI_MODELS[0]; // for logging

// Cached system settings - refreshes every 60s
let _settingsCache = null;
let _settingsCacheTime = 0;
const getSettings = async () => {
    const now = Date.now();
    if (_settingsCache && (now - _settingsCacheTime) < 60000) return _settingsCache;
    try {
        _settingsCache = await SystemSetting.findOne().lean();
        _settingsCacheTime = now;
    } catch (e) {
        return null;
    }
    return _settingsCache;
};

// Fallback helper for Ollama text generation
const callOllama = async (prompt, formatJSON = false) => {
    try {
        const { url, model } = getOllamaConfig();
        console.log(`[Ollama] Sending request to local model (${model})...`);
        const response = await axios.post(`${url}/api/generate`, {
            model: model,
            prompt: prompt,
            stream: false,
            ...(formatJSON && { format: 'json' })
        }, { timeout: 20000 });
        return response.data.response;
    } catch (err) {
        console.error("[Ollama] Fallback also failed:", err.message);
        throw new Error("Both Gemini and Ollama failed.");
    }
};

// ============================================================
// GEMINI ERROR ANALYZER — Shows root cause clearly in terminal
// ============================================================
const analyzeGeminiError = (error, keyIndex, attempt) => {
    const statusCode = error?.status || error?.response?.status || error?.code || 'UNKNOWN';
    const rawMsg     = error?.message || String(error);
    const details    = error?.errorDetails || error?.response?.data?.error || null;

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

    const sep = '─'.repeat(60);
    console.error(`\n\x1b[31m┌${sep}┐\x1b[0m`);
    console.error(`\x1b[31m│  🔴 GEMINI API ERROR  (Key ${keyIndex + 1}, Attempt ${attempt + 1})\x1b[0m`);
    console.error(`\x1b[31m├${sep}┤\x1b[0m`);
    console.error(`\x1b[33m│  Category   :\x1b[0m ${category}`);
    console.error(`\x1b[33m│  HTTP Code  :\x1b[0m ${statusCode}`);
    console.error(`\x1b[33m│  Model      :\x1b[0m ${GEMINI_MODEL}`);
    console.error(`\x1b[33m│  Raw Error  :\x1b[0m ${rawMsg.substring(0, 200)}`);
    if (details) console.error(`\x1b[33m│  Details    :\x1b[0m ${JSON.stringify(details).substring(0, 200)}`);
    console.error(`\x1b[36m│  Suggestion :\x1b[0m ${suggestion || 'Unknown error — check logs above.'}`);
    console.error(`\x1b[31m└${sep}┘\x1b[0m\n`);

    return category;
};

// ============================================================
// CENTRAL MULTI-KEY FALLBACK EXECUTOR
// Tries KEY_1, then KEY_2. If both fail, throws.
// ============================================================
let currentKeyIndex = 0;

const executeWithFallback = async (executeFn) => {
    const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2
    ].filter(Boolean);

    if (keys.length === 0) {
        console.error('\x1b[31m[Gemini] FATAL: No API keys found in .env!\x1b[0m');
        throw new Error("No GEMINI_API_KEY found in environment.");
    }

    // Build (key, model) combos pool
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
        const { key: keyToUse, model: modelToUse } = combos[currentKeyIndex % totalCombos];
        console.log(`\x1b[36m[Gemini aiService]\x1b[0m Combo ${currentKeyIndex % totalCombos + 1}/${totalCombos} — Model: ${modelToUse}, Key: ...${keyToUse.slice(-6)}`);
        try {
            const ai = new GoogleGenAI({ apiKey: keyToUse });
            const result = await executeFn(ai, modelToUse);
            console.log(`\x1b[32m[Gemini aiService] ✓ Success — Model: ${modelToUse}\x1b[0m`);
            return result;
        } catch (err) {
            lastError = err;
            lastCategory = analyzeGeminiError(err, currentKeyIndex % totalCombos, attempt);
            currentKeyIndex++;
            if (attempt + 1 < totalCombos) {
                const next = combos[currentKeyIndex % totalCombos];
                if (['QUOTA_EXHAUSTED', 'MODEL_NOT_FOUND', 'INVALID_API_KEY'].includes(lastCategory)) {
                    console.warn(`\x1b[33m[Gemini aiService] Quota on ${modelToUse}. Switching to ${next.model}...\x1b[0m`);
                } else {
                    console.warn(`\x1b[33m[Gemini aiService] Transient error. Retrying with ${next.model}...\x1b[0m`);
                }
            }
        }
    }
    console.error(`\x1b[31m[Gemini aiService] ALL ${totalCombos} combos exhausted [${lastCategory}].\x1b[0m`);
    throw new Error(`All Gemini combos failed [${lastCategory}]: ${lastError?.message}`);
};


/**
 * Clean Job Description text to save tokens and improve extraction accuracy
 */
const cleanText = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/<[^>]*>?/gm, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned.substring(0, 5000);
};

export const parseJobDescription = async (jobId, title, description) => {
    try {
        console.log(`[Job Intelligence] Starting extraction for Job: ${title}`);
        await Job.findByIdAndUpdate(jobId, { intelligenceStatus: 'Processing' });

        const cleanedDescription = cleanText(description);
        const prompt = `
            You are an expert technical recruiter and IT ontology system.
            Extract all distinct hard skills, frameworks, tools, and programming languages from the following job description.
            Do not extract soft skills (e.g. "communication", "teamwork").
            Also infer the normalized job role (e.g., 'Frontend Developer', 'Data Scientist') and the experience required (e.g., '0-2 years', '5+ years').
            
            CRITICAL INSTRUCTION FOR REGIONAL LANGUAGES: The job description might be written in English, Hinglish, Hindi, or a mix of regional Indian languages (e.g., "Accounting ka kaam aana chahiye Tally pe"). You must semantically understand the mixed text and ALWAYS map the extracted technical skills to standard English canonical names (e.g., extract "Tally" and "Accounting").
            
            Job Title: ${title}
            Job Description: ${cleanedDescription}
            
            Return ONLY a valid JSON object matching this schema exactly, and nothing else.
            {
                "extractedRole": "Normalized Role Name",
                "inferredExperience": "Experience level string",
                "skills": [
                    { "name": "Skill Name", "confidence": 0.95 }
                ]
            }
            Ensure no markdown formatting or backticks wrap the JSON response.
        `;

        let jsonString = "";
        try {
            const settings = await getSettings();
            if (settings && settings.forceOllama) {
                console.log("[System] Force Ollama is ON. Bypassing Gemini...");
                throw new Error("Forced Ollama Bypass");
            }
            jsonString = await executeWithFallback(async (ai, model) => {
                const response = await ai.models.generateContent({
                    model: model,
                    contents: prompt,
                    config: {
                        temperature: 0.1,
                        responseMimeType: "application/json"
                    }
                });
                return response.text;
            });
        } catch (geminiError) {
            console.warn(`[Job Intelligence] Gemini failed (${geminiError.message}). Falling back to Ollama...`);
            jsonString = await callOllama(prompt, true);
        }

        jsonString = jsonString.replace(/```json/gi, '').replace(/```/g, '').trim();
        let extractedData;
        try {
            extractedData = JSON.parse(jsonString);
        } catch (parseErr) {
            throw new Error("Failed to parse Gemini output as JSON: " + jsonString);
        }

        if (!extractedData || !Array.isArray(extractedData.skills)) {
            throw new Error("Gemini returned invalid schema format.");
        }

        const extractedSkills = extractedData.skills;
        console.log(`[Job Intelligence] LLM Extracted ${extractedSkills.length} potential skills.`);

        await JobIntelligence.findOneAndUpdate(
            { jobId },
            {
                extractedRole: extractedData.extractedRole || title,
                inferredExperience: extractedData.inferredExperience || 'Not specified',
                extractedSkills: extractedSkills.map(s => s.name),
                processedAt: new Date()
            },
            { upsert: true, new: true }
        );

        let matchedCount = 0;
        let unresolvedCount = 0;
        const normalizedSkillNames = new Set();

        for (const extracted of extractedSkills) {
            const rawName = extracted.name;
            if (!rawName || typeof rawName !== 'string') continue;

            const normalizedInput = rawName.trim();
            const confidence = typeof extracted.confidence === 'number' ? extracted.confidence : 0;

            const skillDoc = await Skill.findOne({
                $or: [
                    { name: { $regex: new RegExp(`^${normalizedInput}$`, "i") } },
                    { aliases: { $regex: new RegExp(`^${normalizedInput}$`, "i") } }
                ]
            });

            if (skillDoc) {
                await JobSkill.findOneAndUpdate(
                    { jobId, skillId: skillDoc._id },
                    { proficiency: 'Unspecified', isCore: true, extractedViaAI: true },
                    { upsert: true, new: true }
                );
                matchedCount++;
                normalizedSkillNames.add(skillDoc.name);
            } else {
                const normalizedForUnique = normalizedInput.toLowerCase();
                await UnresolvedSkill.findOneAndUpdate(
                    { jobId, normalizedName: normalizedForUnique },
                    { rawName: rawName, confidence: confidence, status: 'pending' },
                    { upsert: true }
                );
                unresolvedCount++;
                normalizedSkillNames.add(rawName);
            }
        }

        await Job.findByIdAndUpdate(jobId, {
            intelligenceStatus: 'Completed',
            intelligenceLastError: null,
            intelligenceRetryCount: 0,
            skills: Array.from(normalizedSkillNames)
        });

        console.log(`[Job Intelligence] Successfully mapped ${matchedCount} skills to Job ${jobId}. Recorded ${unresolvedCount} unknown skills.`);

    } catch (error) {
        console.error(`[Job Intelligence Error] Job: ${jobId}`, error);
        await Job.findByIdAndUpdate(jobId, {
            intelligenceStatus: 'Failed',
            intelligenceLastError: error.message,
            $inc: { intelligenceRetryCount: 1 }
        });
    }
};

/**
 * Step 10: AI What-If Simulator - Phase 1: Intent Extraction
 */
export const extractSimulationIntent = async (userPrompt) => {
    const prompt = `
        You are an AI assistant for a Government Skill & Labor Intelligence Platform.
        A policymaker is asking a "What-If" question about opening new training batches.
        Extract the intent from the following question into a structured JSON format.
        
        Question: "${userPrompt}"
        
        Return ONLY a valid JSON object matching this schema exactly, and nothing else.
        {
            "queryType": "specific_injection" or "open_ended_suggestion",
            "skill": "Extracted main skill name (e.g. Python, Java, Data Science) or null",
            "district": "Extracted city/district name or null",
            "proposedBatches": "Number of batches proposed (integer) or null",
            "estimatedSeats": "Calculate proposedBatches * 50 if batches exist, else null"
        }
        Ensure no markdown formatting or backticks wrap the JSON response.
    `;

    try {
        const settings = await getSettings();
        if (settings && settings.forceOllama) {
            console.log("[System] Force Ollama is ON. Bypassing Gemini...");
            throw new Error("Forced Ollama Bypass");
        }

        const responseText = await executeWithFallback(async (ai, model) => {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: { temperature: 0.1, responseMimeType: "application/json" }
            });
            return response.text;
        });
        const intent = JSON.parse(responseText.replace(/```json/gi, '').replace(/```/g, '').trim());
        return { ...intent, isFallback: false };
    } catch (err) {
        console.warn(`[AI Service] Intent extract failed (${err.message}). Falling back to Ollama...`);
        try {
            const ollamaText = await callOllama(prompt, true);
            const intent = JSON.parse(ollamaText.replace(/```json/gi, '').replace(/```/g, '').trim());
            return { ...intent, isFallback: true };
        } catch (ollamaErr) {
            console.error("[AI Service] Ollama intent fallback also failed:", ollamaErr.message);
            return {
                queryType: "specific_injection",
                skill: "React (Fallback)",
                district: "Overall",
                proposedBatches: 2,
                estimatedSeats: 100,
                isFallback: true
            };
        }
    }
};

/**
 * Step 10b: AI What-If Simulator - Phase 2b: Open Ended Suggestion
 */
export const generateOpenEndedPrediction = async (userPrompt, topGaps) => {
    const prompt = `
        You are an expert advisor for the Government Skill Development Mission.
        The policymaker asks: "${userPrompt}"
        
        Here is the REAL-TIME Market Data showing top skill shortages (positive gap means shortage):
        ${JSON.stringify(topGaps)}
        
        Provide a professional, actionable suggestion in Markdown format. Recommend which courses to open based on the data. Use bolding and bullet points where necessary. Keep it under 150 words.
    `;

    try {
        const settings = await getSettings();
        if (settings && settings.forceOllama) {
            console.log("[System] Force Ollama is ON. Bypassing Gemini...");
            throw new Error("Forced Ollama Bypass");
        }
        const responseText = await executeWithFallback(async (ai, model) => {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: { temperature: 0.5 }
            });
            return response.text;
        });
        return { text: responseText, isFallback: false };
    } catch (err) {
        console.warn(`[AI Service] Open Ended Prediction failed (${err.message}). Falling back to Ollama...`);
        try {
            const ollamaText = await callOllama(prompt);
            return { text: ollamaText, isFallback: true };
        } catch (ollamaErr) {
            return {
                text: `[STATIC FALLBACK]\nBased on the data, focus on high-demand skills.`,
                isFallback: true
            };
        }
    }
};

/**
 * Step 10: AI What-If Simulator - Phase 2: Prediction Generation
 */
export const generateSimulationPrediction = async (intent, marketData) => {
    const prompt = `
        You are a senior data analyst and advisor for the Government Skill Development Mission.
        The policymaker wants to know the outcome of this hypothetical scenario:
        "Opening ${intent.proposedBatches} new batches (${intent.estimatedSeats} seats) for ${intent.skill} in ${intent.district}."

        Here is the REAL-TIME Market Data from our database:
        - Active Jobs in ${intent.district} requiring ${intent.skill}: ${marketData.activeJobs}
        - Current Training Supply (Seats) in ${intent.district} for ${intent.skill}: ${marketData.currentSupply}
        - Current Market Gap (Jobs - Supply): ${marketData.gap}
        
        Based on this data, provide a professional, concise prediction of the outcome if these new batches are opened.
        Will the students get placed easily? Is there oversupply or undersupply? 
        Give a clear recommendation in Markdown format. Use bolding and bullet points if helpful.
        Keep your response under 4 sentences. Write in a direct, professional tone.
    `;

    try {
        const settings = await getSettings();
        if (settings && settings.forceOllama) {
            console.log("[System] Force Ollama is ON. Bypassing Gemini...");
            throw new Error("Forced Ollama Bypass");
        }
        const responseText = await executeWithFallback(async (ai, model) => {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: { temperature: 0.4 }
            });
            return response.text;
        });
        return { text: responseText, isFallback: false };
    } catch (err) {
        console.warn(`[AI Service] Prediction failed (${err.message}). Falling back to Ollama...`);
        try {
            const ollamaText = await callOllama(prompt);
            return { text: ollamaText, isFallback: true };
        } catch (ollamaErr) {
            return {
                text: `[STATIC FALLBACK]\nBased on the current market data, adding these batches will significantly help reduce the skill gap for ${intent.skill} in ${intent.district}. We highly recommend proceeding with this policy action to ensure strong placements.`,
                isFallback: true
            };
        }
    }
};

export const generatePolicyInsights = async (forecastData) => {
    const { emergingSkills, decliningSkills, shortages } = forecastData;

    const summaryData = {
        emerging: emergingSkills.map(s => `${s.skill} (+${s.growthPercentage}%)`),
        declining: decliningSkills.map(s => `${s.skill} (${s.growthPercentage}%)`),
        shortages: shortages.map(s => `${s.skill} (Gap: ${s.projectedGap})`)
    };

    const prompt = `
        You are a senior data advisor for the State Skill Development Mission. 
        I am giving you a highly condensed summary of our latest predictive skill forecast. 
        
        Emerging Skills: ${summaryData.emerging.join(', ') || 'None identified'}
        Declining Skills: ${summaryData.declining.join(', ') || 'None identified'}
        Projected Future Shortages: ${summaryData.shortages.join(', ') || 'None identified'}

        Provide a short, highly professional policy interpretation (max 4 sentences).
        What should the state government focus on? What are the risks of ignoring these trends?
        Do not calculate numbers, just provide strategic advice based on these exact lists.
    `;

    try {
        const settings = await getSettings();
        if (settings && settings.forceOllama) {
            console.log("[System] Force Ollama is ON. Bypassing Gemini...");
            throw new Error("Forced Ollama Bypass");
        }
        const responseText = await executeWithFallback(async (ai, model) => {
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: { temperature: 0.3 }
            });
            return response.text;
        });
        return responseText;
    } catch (err) {
        console.warn(`[AI Service] Policy insights failed: ${err.message}`);
        return "AI Insight generation failed at this time. However, based on the data, the state should focus on expanding training capacity for the listed emerging and shortage skills.";
    }
};



