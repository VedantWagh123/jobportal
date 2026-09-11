import { GoogleGenAI } from '@google/genai';
import Skill from "../models/Skill.js";
import JobSkill from "../models/JobSkill.js";
import UnresolvedSkill from "../models/UnresolvedSkill.js";
import Job from "../models/Job.js";
import JobIntelligence from "../models/JobIntelligence.js";

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

        // 2. Call Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1, // Keep it deterministic
                responseMimeType: "application/json"
            }
        });

        const jsonString = response.text;
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
        console.warn("[AI Service] GEMINI_API_KEY is missing. Using Fallback Intent.");
        return {
            skill: "React (Fallback)",
            district: "Overall",
            proposedBatches: 2,
            estimatedSeats: 100,
            isFallback: true
        };
    }

    const prompt = `
        You are an AI assistant for a Government Skill & Labor Intelligence Platform.
        A policymaker is asking a "What-If" question about opening new training batches.
        Extract the intent from the following question into a structured JSON format.
        
        Question: "${userPrompt}"
        
        Return ONLY a valid JSON object matching this schema exactly, and nothing else.
        {
            "skill": "Extracted main skill name (e.g. Python, Java, Data Science) or null",
            "district": "Extracted city/district name or null",
            "proposedBatches": "Number of batches proposed (integer) or null",
            "estimatedSeats": "Calculate proposedBatches * 50 if batches exist, else null"
        }
        Ensure no markdown formatting or backticks wrap the JSON response.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        const intent = JSON.parse(response.text);
        return { ...intent, isFallback: false };
    } catch (err) {
        console.error("[AI Service] Intent extract failed or rate limited:", err.message);
        // Fallback Intent
        return {
            skill: "React (Fallback)",
            district: "Overall",
            proposedBatches: 2,
            estimatedSeats: 100,
            isFallback: true
        };
    }
};

/**
 * Step 10: AI What-If Simulator - Phase 2: Prediction Generation
 */
export const generateSimulationPrediction = async (intent, marketData) => {
    const ai = getAIInstance();
    if (!ai) {
        console.warn("[AI Service] GEMINI_API_KEY is missing. Using Fallback Prediction.");
        return { 
            text: `[FALLBACK MODE - API KEY MISSING]\nBased on the current market data, adding these batches will significantly help reduce the skill gap for ${intent.skill} in ${intent.district}. We highly recommend proceeding with this policy action to ensure strong placements.`,
            isFallback: true
        };
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
        Give a clear recommendation.
        Keep your response under 4 sentences. Write in a direct, professional tone.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.4,
            }
        });

        return { text: response.text, isFallback: false };
    } catch (err) {
        console.error("[AI Service] Prediction failed or rate limited:", err.message);
        return { 
            text: `[FALLBACK MODE - API QUOTA EXCEEDED]\nBased on the current market data, adding these batches will significantly help reduce the skill gap for ${intent.skill} in ${intent.district}. We highly recommend proceeding with this policy action to ensure strong placements.`,
            isFallback: true
        };
    }
};
