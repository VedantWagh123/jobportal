import Job from '../models/Job.js';
import { generateResponse } from '../services/geminiAiService.js';

// ─── Helper ───────────────────────────────────────────────────────────────────
const cleanText = (text) => text?.trim() || '';

// ─── Main Controller (RAG Architecture) ───────────────────────────────────────
export const chatWithAI = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }


        // 1. Fetch Job Context (Top 30 latest active jobs)
        // We populate companyId so we can send full data to frontend later
        const activeJobs = await Job.find({ visible: true })
            .populate('companyId', 'name image location description industry companySize website linkedinUrl contactDetails foundedYear')
            .sort({ date: -1 })
            .limit(100)
            .lean();

        // Prepare a lightweight version of jobs for the AI context to save tokens
        const jobsForAI = activeJobs.map(j => ({
            id: j._id,
            title: j.title,
            category: j.category,
            skills: j.skills || [],
            location: j.location,
            level: j.level,
            salary: j.salary,
            vacancies: j.vacancies,
            company: j.companyId?.name || 'Unknown'
        }));

        // 2. Format History
        const historyText = history.slice(-6).map(m =>
            `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`
        ).join('\n');

        // 3. Build RAG Prompt
        const systemPrompt = `You are SkillSet Career Assistant 🤖 — a highly accurate, smart AI career guide for SkillSet India.
You have FULL access to the following Job Catalog (in JSON format) containing all the active jobs on our portal:
${JSON.stringify(jobsForAI)}

Previous Conversation:
${historyText || 'None'}

User's message: "${message}"

INSTRUCTIONS:
1. Understand the user's intent. The user may use Hinglish, English, or Hindi.
2. JOB SEARCH (CRITICAL STRICTNESS & 100% ACCURACY):
   - You MUST analyze the provided Job Catalog EXACTLY as it is.
   - DO NOT hallucinate, guess, or invent jobs. DO NOT loosely match (e.g., if asked for "web development", do NOT return "database engineering" just because they are both IT).
   - STRICT MATCHING: Only select jobs that ACTUALLY match the user's explicit requested title, category, or skills.
   - If NO jobs match the exact criteria perfectly, you MUST set "isJobSearch": false, return an empty array for "selectedJobIds" [], and politely explain in "textResponse" that there are currently no exact matches for that role on the portal right now, but suggest they try a different keyword.
   - If there are strict matches, pick the best 1 to 5 jobs.
3. If they are asking for career advice, resume tips, or general chat, answer helpfully without selecting any jobs.
4. PERSONALITY: Warm, encouraging, professional with relevant emojis 😊. Use markdown (**bold**, - lists). Keep it concise (2-4 sentences max). Do NOT list the jobs in the text response if you selected jobs, just say "Here are some exact matches I found:" or similar.
5. You MUST respond with a VALID JSON object matching this exact schema:
{
    "isJobSearch": boolean,
    "textResponse": "Your conversational, friendly response here",
    "selectedJobIds": ["id1", "id2"] // Only if STRICT matching jobs were found, otherwise empty array []
}
IMPORTANT: Return ONLY the raw JSON string. Do NOT wrap it in \`\`\`json markdown blocks.`;

        // 4. Generate AI Response using Centralized Engine (with Ollama Fallback / Forced Switch)
        const fallbackJSON = JSON.stringify({
            isJobSearch: false,
            textResponse: "Oops! 😅 I'm having a small hiccup connecting to my AI brain. Please try again in a moment!",
            selectedJobIds: []
        });
        const responseText = await generateResponse(systemPrompt, fallbackJSON);

        // 5. Parse AI Response safely
        let parsed;
        try {
            let rawText = cleanText(responseText).replace(/```json/gi, '').replace(/```/g, '').trim();
            // Sometimes Gemini might add extra text before or after the JSON, so we extract the JSON part
            const jsonStart = rawText.indexOf('{');
            const jsonEnd = rawText.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                rawText = rawText.substring(jsonStart, jsonEnd + 1);
            }
            parsed = JSON.parse(rawText);
        } catch (parseError) {
            console.error('[Chatbot] AI JSON Parse Error:', parseError.message);
            // Fallback: If AI fails to return JSON, just return a generic message and no jobs
            parsed = {
                isJobSearch: false,
                textResponse: "Oops! 😅 My circuits got a little tangled. Could you rephrase your question?",
                selectedJobIds: []
            };
        }

        // 6. Map Selected Job IDs back to full Job Objects
        let formattedJobs = [];
        if (parsed.isJobSearch && parsed.selectedJobIds && Array.isArray(parsed.selectedJobIds)) {
            const selectedFullJobs = activeJobs.filter(j => parsed.selectedJobIds.includes(j._id.toString()));
            
            formattedJobs = selectedFullJobs.map(j => ({
                _id: j._id,
                title: j.title,
                location: j.location,
                salary: j.salary,
                jobType: j.jobType || 'Full Time',
                level: j.level,
                category: j.category,
                skills: j.skills || [],
                company: {
                    name: j.companyId?.name || 'Unknown Company',
                    image: j.companyId?.image || '',
                    location: j.companyId?.location || j.location || '',
                    description: j.companyId?.description || '',
                    industry: j.companyId?.industry || '',
                    website: j.companyId?.website || '',
                    companySize: j.companyId?.companySize || '',
                    foundedYear: j.companyId?.foundedYear || null,
                    linkedinUrl: j.companyId?.linkedinUrl || '',
                    contactDetails: j.companyId?.contactDetails || '',
                }
            }));
        }

        // 7. Send Response
        return res.json({
            success: true,
            type: formattedJobs.length > 0 ? 'job_results' : 'text',
            response: parsed.textResponse || "Here is what I found!",
            jobs: formattedJobs,
        });

    } catch (error) {
        console.error('[Chatbot] Fatal Error:', error.message);
        return res.status(200).json({
            success: true,
            type: 'text',
            response: "Oops! 😅 I'm having a small hiccup connecting to the job store. Please try again in a moment!",
            jobs: [],
        });
    }
};
