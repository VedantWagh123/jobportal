import { GoogleGenAI } from '@google/genai';
import Job from '../models/Job.js';

// ─── Helper ───────────────────────────────────────────────────────────────────
const cleanText = (text) => text?.trim() || '';

// ─── Comprehensive Keyword Alias Map ──────────────────────────────────────────
// When any key is detected, ALL its aliases are also searched in DB
const KEYWORD_ALIASES = {
    // Python
    'python': ['python', 'py', 'django', 'flask', 'fastapi'],
    'pyhton': ['python'], 'phyton': ['python'], 'pythn': ['python'],

    // JavaScript / Web
    'javascript': ['javascript', 'js', 'node', 'nodejs', 'express', 'typescript', 'ts'],
    'js': ['javascript', 'js', 'nodejs'],
    'node': ['node', 'nodejs', 'express', 'javascript'],
    'react': ['react', 'reactjs', 'react.js', 'frontend', 'front-end'],
    'frontend': ['frontend', 'react', 'vue', 'angular', 'html', 'css', 'ui'],
    'backend': ['backend', 'node', 'django', 'spring', 'express', 'api'],
    'fullstack': ['fullstack', 'full stack', 'full-stack', 'mern', 'mean'],
    'mern': ['mern', 'react', 'node', 'mongodb', 'fullstack'],

    // Data Science / AI / ML
    'data science': ['data science', 'data scientist', 'data analyst', 'machine learning', 'ml', 'deep learning', 'ai', 'artificial intelligence'],
    'data scientist': ['data science', 'data scientist', 'machine learning', 'ml', 'analytics'],
    'data analyst': ['data analyst', 'data science', 'analytics', 'bi', 'tableau', 'power bi', 'sql'],
    'datascience': ['data science', 'data scientist', 'machine learning', 'ml'],
    'data sience': ['data science', 'data scientist', 'ml'],
    'ml': ['machine learning', 'ml', 'deep learning', 'ai', 'data science'],
    'machine learning': ['machine learning', 'ml', 'deep learning', 'ai', 'data science', 'nlp'],
    'ai': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'llm', 'generative ai'],
    'aiml': ['ai', 'ml', 'machine learning', 'artificial intelligence', 'deep learning'],
    'artificial intelligence': ['artificial intelligence', 'ai', 'machine learning', 'ml', 'deep learning'],
    'deep learning': ['deep learning', 'machine learning', 'ml', 'ai', 'neural network'],
    'nlp': ['nlp', 'natural language processing', 'llm', 'ai', 'machine learning'],
    'llm': ['llm', 'generative ai', 'ai', 'nlp', 'machine learning'],
    'generative ai': ['generative ai', 'llm', 'ai', 'machine learning', 'nlp'],
    'genai': ['generative ai', 'llm', 'ai', 'machine learning'],

    // DevOps / Cloud
    'devops': ['devops', 'docker', 'kubernetes', 'ci/cd', 'aws', 'cloud', 'linux'],
    'cloud': ['cloud', 'aws', 'azure', 'gcp', 'devops', 'kubernetes'],
    'aws': ['aws', 'cloud', 'devops', 'amazon'],
    'kubernetes': ['kubernetes', 'k8s', 'docker', 'devops'],

    // Mobile
    'android': ['android', 'kotlin', 'java', 'mobile'],
    'ios': ['ios', 'swift', 'mobile', 'apple'],
    'flutter': ['flutter', 'dart', 'mobile', 'cross platform'],
    'react native': ['react native', 'mobile', 'flutter', 'cross platform'],
    'mobile': ['mobile', 'android', 'ios', 'flutter', 'react native'],

    // Java
    'java': ['java', 'spring', 'springboot', 'j2ee', 'backend'],
    'spring': ['spring', 'springboot', 'java', 'backend'],
    'springboot': ['springboot', 'spring', 'java'],

    // Database
    'sql': ['sql', 'mysql', 'postgresql', 'database', 'data analyst'],
    'database': ['database', 'sql', 'mongodb', 'mysql', 'postgresql'],
    'mongodb': ['mongodb', 'nosql', 'database'],

    // Security
    'cybersecurity': ['cybersecurity', 'cyber security', 'security', 'ethical hacking', 'penetration testing'],
    'cyber security': ['cybersecurity', 'cyber security', 'security', 'ethical hacking'],

    // UI/UX
    'ui': ['ui', 'ux', 'ui/ux', 'figma', 'design', 'frontend'],
    'ux': ['ux', 'ui', 'ui/ux', 'design', 'figma'],
    'design': ['design', 'ui', 'ux', 'figma', 'graphic design'],

    // Business / Management
    'hr': ['hr', 'human resources', 'recruitment', 'talent acquisition'],
    'marketing': ['marketing', 'digital marketing', 'seo', 'social media'],
    'sales': ['sales', 'business development', 'bd', 'marketing'],
    'finance': ['finance', 'accounts', 'accounting', 'ca', 'chartered accountant'],
    'management': ['management', 'project management', 'product manager', 'scrum'],

    // Common misspellings / shortcuts
    'develper': ['developer'], 'devloper': ['developer'], 'develope': ['developer'],
    'engneer': ['engineer'], 'engineeer': ['engineer'], 'enginer': ['engineer'],
    'programer': ['programmer'], 'programmar': ['programmer'],
    'sofware': ['software'], 'softare': ['software'],
};

// ─── Expand & Normalize Keywords ─────────────────────────────────────────────
const expandKeywords = (rawKeywords) => {
    const expandedSet = new Set();

    rawKeywords.forEach(kw => {
        const lower = kw.toLowerCase().trim();
        expandedSet.add(lower); // Always add original

        // Direct alias map lookup
        if (KEYWORD_ALIASES[lower]) {
            KEYWORD_ALIASES[lower].forEach(alias => expandedSet.add(alias));
        }

        // Partial match: if user typed something that contains a key
        Object.keys(KEYWORD_ALIASES).forEach(mapKey => {
            if (lower.includes(mapKey) || mapKey.includes(lower)) {
                KEYWORD_ALIASES[mapKey].forEach(alias => expandedSet.add(alias));
            }
        });
    });

    return [...expandedSet];
};

// ─── Step A: Intent Detection with Spelling Normalization ────────────────────
const detectJobSearchIntent = async (ai, message, history) => {
    try {
        const historyText = history.slice(-4).map(m =>
            `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`
        ).join('\n');

        const intentPrompt = `You are an intelligent intent classifier for a Job Portal chatbot.
The user may use: Hinglish, English, Hindi, abbreviations, or MISSPELLED words. 
You MUST understand all of them and correct spelling mistakes.

Conversation History:
${historyText || 'None'}

User's message: "${message}"

RULES:
1. Detect if user wants to SEARCH FOR JOBS (any mention of job/naukri/opening/vacancy/position/role/hiring).
2. Extract NORMALIZED, CORRECTED tech keywords (fix spelling mistakes).
3. Expand abbreviations: "ds" → "data science", "aiml" → "AI ML", "genai" → "generative AI", "fe" → "frontend".
4. If user says "data science job hai kya" → isJobSearch: true, keywords: ["data science"].
5. If user says "koi python ya react job hai" → isJobSearch: true, keywords: ["python", "react"].
6. If user says "resume tips" → isJobSearch: false.

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.
Format: { "isJobSearch": true/false, "keywords": ["normalized_keyword1", "normalized_keyword2"] }`;

        const intentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: intentPrompt,
        });

        let rawText = cleanText(intentResponse.text)
            .replace(/```json/gi, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(rawText);

        // Expand keywords using alias map
        if (parsed.isJobSearch && parsed.keywords?.length > 0) {
            parsed.keywords = expandKeywords(parsed.keywords);
        }
        return parsed;
    } catch (e) {
        console.warn('[Chatbot] Intent detection failed:', e.message);
        // Fallback: try basic keyword matching from message itself
        return { isJobSearch: false, keywords: [] };
    }
};

// ─── Step B: Smart DB Search ──────────────────────────────────────────────────
const searchJobsInDB = async (keywords) => {
    try {
        if (!keywords || keywords.length === 0) return [];

        // Create regex patterns for each keyword
        const regexPatterns = keywords.map(k => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

        const jobs = await Job.find({
            visible: true,
            $or: [
                { title: { $in: regexPatterns } },
                { category: { $in: regexPatterns } },
                { skills: { $in: regexPatterns } },
                { description: { $in: regexPatterns } },  // also search in description
                { level: { $in: regexPatterns } },
            ]
        })
        .populate('companyId', 'name image location description industry companySize website linkedinUrl contactDetails foundedYear')
        .sort({ date: -1 })  // newest first
        .limit(6)
        .lean();

        return jobs;
    } catch (e) {
        console.error('[Chatbot] DB Job Search Error:', e.message);
        return [];
    }
};

// ─── Step C: Final AI Response ────────────────────────────────────────────────
const generateFinalResponse = async (ai, message, history, jobs, keywords, originalKeywords) => {
    const historyText = history.slice(-6).map(m =>
        `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`
    ).join('\n');

    let systemPrompt = `You are SkillSet Career Assistant 🤖 — a friendly, smart AI career guide for SkillSet India.

PERSONALITY:
- Warm, encouraging, professional with relevant emojis 😊
- Speak in Hinglish when user does, else English
- Understand misspellings and abbreviations — never point out user's spelling mistakes
- Give concise but complete answers

FORMATTING:
- Use **bold** for important terms
- Use "- " for bullet lists  
- Keep under 200 words unless complex
- Always end with a follow-up question or suggestion

Previous Conversation:
${historyText || 'None'}

`;

    if (jobs && jobs.length > 0) {
        const userSearchedFor = originalKeywords?.join(', ') || keywords?.slice(0, 2).join(', ');
        systemPrompt += `User searched for "${userSearchedFor}" jobs. I found **${jobs.length} matching job(s)**!
Write a short, enthusiastic 2-sentence response. 
Mention job count and searched skill. Encourage clicking "Apply Now". 
DO NOT list jobs (UI shows job cards below).
Example: "Great news! 🎉 I found **${jobs.length} ${userSearchedFor} jobs** on SkillSet right now — check them out below and hit Apply Now! 🚀"`;

    } else if (jobs !== null && keywords?.length > 0) {
        const userSearchedFor = originalKeywords?.join(', ') || keywords?.slice(0, 2).join(', ');
        systemPrompt += `User searched for "${userSearchedFor}" jobs but ZERO matches found in DB.
1. Politely say no jobs available for this right now.
2. Suggest 2-3 RELATED skills/roles they can try searching for.
3. Mention upskilling courses available on SkillSet.
Keep it warm. Max 3-4 sentences. Don't mention any spelling mistakes.`;
    }

    systemPrompt += `\n\nUser's message: "${message}"\nAssistant:`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
    });

    return cleanText(response.text);
};

// ─── Main Controller ──────────────────────────────────────────────────────────
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

        // ── Step A: Smart Intent Detection ──
        const intent = await detectJobSearchIntent(ai, message, history);
        const originalKeywords = intent.keywords?.slice(0, 3); // Keep first 3 for display

        let jobs = [];
        let responseType = 'text';

        // ── Step B: DB Search with expanded keywords ──
        if (intent.isJobSearch && intent.keywords?.length > 0) {
            jobs = await searchJobsInDB(intent.keywords);
            responseType = 'job_results';
        }

        // ── Step C: AI Response ──
        const aiText = await generateFinalResponse(
            ai, message, history,
            intent.isJobSearch ? jobs : null,
            intent.keywords || [],
            originalKeywords || []
        );

        // ── Format Jobs for Frontend ──
        const formattedJobs = jobs.map(j => ({
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

        return res.json({
            success: true,
            type: responseType,
            response: aiText,
            jobs: formattedJobs,
        });

    } catch (error) {
        console.error('[Chatbot] Fatal Error:', error.message);
        return res.status(200).json({
            success: true,
            type: 'text',
            response: "Oops! 😅 I'm having a small hiccup. Please try again in a moment!",
            jobs: [],
        });
    }
};
