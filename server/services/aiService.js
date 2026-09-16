import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import Skill from "../models/Skill.js";
import JobSkill from "../models/JobSkill.js";
import UnresolvedSkill from "../models/UnresolvedSkill.js";
import Job from "../models/Job.js";
import JobIntelligence from "../models/JobIntelligence.js";

const OLLAMA_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'llava';

// Fallback helper for Ollama text generation
const callOllama = async (prompt, formatJSON = false) => {
    try {
        console.log("[Ollama] Sending request to local model...");
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            ...(formatJSON && { format: 'json' }) // Some Ollama versions support this flag
        });
        return response.data.response;
    } catch (err) {
        console.error("[Ollama] Fallback also failed:", err.message);
        throw new Error("Both Gemini and Ollama failed.");
    }
};

// Initialize Gemini SDK lazily to avoid dotenv hoisting issues
const getAIInstance = () => {
    return process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
};

/**
 * Clean Job Description text to save tokens and improve extraction accuracy
 */
const cleanText = (text) => {
    if (!text) return "";
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>?/gm, ' ');
    // Remove excessive whitespace and newlines
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    // Cap at 5000 characters just in case it's huge
    return cleaned.substring(0, 5000);
};

export const parseJobDescription = async (jobId, title, description) => {
    try {
        console.log(`[Job Intelligence] Starting extraction for Job: ${title}`);
        
        // 1. Update Job Status to Processing
        await Job.findByIdAndUpdate(jobId, { intelligenceStatus: 'Processing' });

        const ai = getAIInstance();
        if (!ai) {
            throw new Error("GEMINI_API_KEY is not configured.");
        }

        const cleanedDescription = cleanText(description);

        const prompt = `
            You are an expert technical recruiter and IT ontology system.
            Extract all distinct hard skills, frameworks, tools, and programming languages from the following job description.
            Do not extract soft skills (e.g. "communication", "teamwork").
            Also infer the normalized job role (e.g., 'Frontend Developer', 'Data Scientist') and the experience required (e.g., '0-2 years', '5+ years').
            
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

        // 2. Call Gemini or Fallback to Ollama
        let jsonString = "";
        try {
            if (!ai) throw new Error("GEMINI_API_KEY is not configured.");
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.1, // Keep it deterministic
                    responseMimeType: "application/json"
                }
            });
            jsonString = response.text;
        } catch (geminiError) {
            console.warn(`[Job Intelligence] Gemini failed (${geminiError.message}). Falling back to Ollama...`);
            jsonString = await callOllama(prompt, true);
        }

        // Clean JSON string (remove markdown ticks if present)
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

        // 3. Controlled Normalization & Matching
        let matchedCount = 0;
        let unresolvedCount = 0;
        const normalizedSkillNames = new Set();

        for (const extracted of extractedSkills) {
            const rawName = extracted.name;
            if (!rawName || typeof rawName !== 'string') continue;

            const normalizedInput = rawName.trim();
            const confidence = typeof extracted.confidence === 'number' ? extracted.confidence : 0;

            // Search Master Ontology by Exact Name OR by Alias (case-insensitive)
            const skillDoc = await Skill.findOne({
                $or: [
                    { name: { $regex: new RegExp(`^${normalizedInput}$`, "i") } },
                    { aliases: { $regex: new RegExp(`^${normalizedInput}$`, "i") } }
                ]
            });

            if (skillDoc) {
                // MATCH FOUND: Create/Update JobSkill
                await JobSkill.findOneAndUpdate(
                    { jobId, skillId: skillDoc._id },
                    { 
                        proficiency: 'Unspecified', 
                        isCore: true,
                        extractedViaAI: true 
                    },
                    { upsert: true, new: true }
                );
                matchedCount++;
                normalizedSkillNames.add(skillDoc.name);
            } else {
                // NO MATCH: Create UnresolvedSkill for Admin review
                // Convert to lowercase for unique indexing of unresolved skills
                const normalizedForUnique = normalizedInput.toLowerCase();
                
                await UnresolvedSkill.findOneAndUpdate(
                    { jobId, normalizedName: normalizedForUnique },
                    {
                        rawName: rawName,
                        confidence: confidence,
                        status: 'pending'
                    },
                    { upsert: true }
                );
                unresolvedCount++;
                normalizedSkillNames.add(rawName);
            }
        }

        // 4. Update Job Status to Completed
        await Job.findByIdAndUpdate(jobId, { 
            intelligenceStatus: 'Completed',
            intelligenceLastError: null,
            intelligenceRetryCount: 0, // Reset on success
            skills: Array.from(normalizedSkillNames) // Sync normalized skills to Job array for frontend
        });

        console.log(`[Job Intelligence] Successfully mapped ${matchedCount} skills to Job ${jobId}. Recorded ${unresolvedCount} unknown skills.`);

    } catch (error) {
        console.error(`[Job Intelligence Error] Job: ${jobId}`, error);
        
        // Mark Job as Failed so it can be retried later
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
    const ai = getAIInstance();
    if (!ai) {
        console.warn("[AI Service] GEMINI_API_KEY is missing. Will try Ollama Fallback Intent.");
    }

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
        let responseText = "";
        if (!ai) throw new Error("GEMINI_API_KEY missing");
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });
        responseText = response.text;
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
            // Final Static Fallback
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
    const ai = getAIInstance();
    if (!ai) {
        console.warn("[AI Service] GEMINI_API_KEY is missing. Will try Ollama Open Ended Prediction.");
    }

    const prompt = `
        You are an expert advisor for the Government Skill Development Mission.
        The policymaker asks: "${userPrompt}"
        
        Here is the REAL-TIME Market Data showing top skill shortages (positive gap means shortage):
        ${JSON.stringify(topGaps)}
        
        Provide a professional, actionable suggestion in Markdown format. Recommend which courses to open based on the data. Use bolding and bullet points where necessary. Keep it under 150 words.
    `;

    try {
        if (!ai) throw new Error("GEMINI_API_KEY missing");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.5 }
        });
        return { text: response.text, isFallback: false };
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
    const ai = getAIInstance();
    if (!ai) {
        console.warn("[AI Service] GEMINI_API_KEY is missing. Will try Ollama Fallback Prediction.");
    }

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
        if (!ai) throw new Error("GEMINI_API_KEY missing");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.4,
            }
        });

        return { text: response.text, isFallback: false };
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
    const ai = getAIInstance();
    if (!ai) {
        console.warn("[AI Service] GEMINI_API_KEY is missing. Will return fallback insights.");
        return "AI Policy Insights are currently unavailable because the API key is not configured.";
    }

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
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.3,
            }
        });
        return response.text;
    } catch (err) {
        console.warn(`[AI Service] Policy insights failed: ${err.message}`);
        return "AI Insight generation failed at this time. However, based on the data, the state should focus on expanding training capacity for the listed emerging and shortage skills.";
    }
};
