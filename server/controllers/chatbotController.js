import { GoogleGenAI } from '@google/genai';
import Job from '../models/Job.js';

// ─── Helper ───────────────────────────────────────────────────────────────────
const cleanText = (text) => text?.trim() || '';

// ─── Main Controller (RAG Architecture) ───────────────────────────────────────
export const chatWithAI = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: 'AI service not configured.' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // 1. Fetch Job Context (Top 30 latest active jobs)
        // We populate companyId so we can send full data to frontend later
        const activeJobs = await Job.find({ visible: true })
            .populate('companyId', 'name image location description industry companySize website linkedinUrl contactDetails foundedYear')
            .sort({ date: -1 })
            .limit(30)
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
        const systemPrompt = `You are SkillSet Career Assistant 🤖 — a friendly, smart AI career guide for SkillSet India.
You have access to the following Job Catalog (in JSON format) containing the latest active jobs on our portal:
${JSON.stringify(jobsForAI)}

Previous Conversation:
${historyText || 'None'}

User's message: "${message}"

INSTRUCTIONS:
1. Understand the user's intent. The user may use Hinglish, English, or Hindi.
2. If they are asking for jobs (e.g., "highly demand jobs", "react jobs", "suggest a job", "high salary jobs"):
   - Analyze the Job Catalog.
   - For "highly demand", prefer jobs with high vacancies or top salaries.
   - For specific skills or roles, match the title, category, or skills.
   - Pick the best 1 to 5 matching jobs.
3. If they are asking for career advice, resume tips, or general chat, answer helpfully without selecting any jobs.
4. PERSONALITY: Warm, encouraging, professional with relevant emojis 😊. Use markdown (**bold**, - lists). Keep it concise (2-4 sentences max). Do NOT list the jobs in the text response, just say "Here are some great matches:" or similar, because the UI will display the job cards automatically.
5. You MUST respond with a VALID JSON object matching this exact schema:
{
    "isJobSearch": boolean,
    "textResponse": "Your conversational, friendly response here",
    "selectedJobIds": ["id1", "id2"] // Only if jobs were found, otherwise empty array []
}
IMPORTANT: Return ONLY the raw JSON string. Do NOT wrap it in \`\`\`json markdown blocks.`;

        // 4. Generate AI Response
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemPrompt,
        });

        // 5. Parse AI Response safely
        let parsed;
        try {
            let rawText = cleanText(response.text).replace(/```json/gi, '').replace(/```/g, '').trim();
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
