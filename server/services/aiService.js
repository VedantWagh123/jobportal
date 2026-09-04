import { GoogleGenAI } from '@google/genai';
import Skill from "../models/Skill.js";
import JobSkill from "../models/JobSkill.js";
import UnresolvedSkill from "../models/UnresolvedSkill.js";
import Job from "../models/Job.js";

// Initialize Gemini SDK
// It automatically picks up GEMINI_API_KEY from environment variables
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

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

        if (!ai) {
            throw new Error("GEMINI_API_KEY is not configured.");
        }

        const cleanedDescription = cleanText(description);

        const prompt = `
            You are an expert technical recruiter and IT ontology system.
            Extract all distinct hard skills, frameworks, tools, and programming languages from the following job description.
            Do not extract soft skills (e.g. "communication", "teamwork").
            
            Job Title: ${title}
            Job Description: ${cleanedDescription}
            
            Return ONLY a valid JSON object matching this schema exactly, and nothing else.
            {
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

        // 3. Controlled Normalization & Matching
        let matchedCount = 0;
        let unresolvedCount = 0;

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
            }
        }

        // 4. Update Job Status to Completed
        await Job.findByIdAndUpdate(jobId, { 
            intelligenceStatus: 'Completed',
            intelligenceLastError: null,
            intelligenceRetryCount: 0 // Reset on success
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
    if (!ai) throw new Error("GEMINI_API_KEY is not configured.");

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

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.1,
            responseMimeType: "application/json"
        }
    });

    try {
        const intent = JSON.parse(response.text);
        return intent;
    } catch (err) {
        console.error("[AI Service] Intent parse failed:", response.text);
        throw new Error("Failed to parse intent from AI");
    }
};

/**
 * Step 10: AI What-If Simulator - Phase 2: Prediction Generation
 */
export const generateSimulationPrediction = async (intent, marketData) => {
    if (!ai) throw new Error("GEMINI_API_KEY is not configured.");

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

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.4,
        }
    });

    return response.text;
};
