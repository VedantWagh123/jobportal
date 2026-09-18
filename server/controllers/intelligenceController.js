import Job from "../models/Job.js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import JobIntelligence from "../models/JobIntelligence.js";
import { parseJobDescription } from "../services/aiService.js";
import { runAIAnalysis, generateChatResponse } from '../services/geminiAiService.js';

// @route   POST /api/intelligence/parse-job
export const parseJobManually = async (req, res, next) => {
    try {
        const { jobId } = req.body;
        if (!jobId) return res.status(400).json({ success: false, message: "jobId is required" });

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        // Run synchronously for testing/admin purposes
        await parseJobDescription(job._id, job.title, job.description);

        const intelligence = await JobIntelligence.findOne({ jobId });
        res.json({ success: true, message: "Job parsed successfully", intelligence });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/intelligence/status/:jobId
export const getIntelligenceStatus = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId).select('intelligenceStatus intelligenceLastError');
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        const intelligence = await JobIntelligence.findOne({ jobId });

        res.json({ 
            success: true, 
            status: job.intelligenceStatus, 
            error: job.intelligenceLastError,
            intelligence 
        });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/intelligence/ask
export const askSmartAssistant = async (req, res, next) => {
    try {
        const { question, chatHistory } = req.body;
        
        // Convert chatHistory to Gemini's expected contents array format
        // System instructions can be prepended as a model message or user message.
        // For Gemini, we typically use { role: 'user' | 'model', parts: [{ text }] }
        let contents = [];
        
        if (chatHistory && Array.isArray(chatHistory)) {
            // Filter out the initial static greeting from the UI if it's there
            const filteredHistory = chatHistory.filter(msg => 
                msg.content !== 'Hello! I am SkillSet India AI. How can I help you today?'
            );
            
            contents = filteredHistory.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
        } else if (question) {
            // Fallback if frontend only sends question
            contents = [{ role: 'user', parts: [{ text: question }] }];
        } else {
            return res.status(400).json({ success: false, message: 'Question or chat history is required.' });
        }

        // Fetch real-time RAG Context for Admin Intelligence
        const totalJobs = await Job.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalCompanies = await Company.countDocuments();

        // Add System prompt at the beginning to set persona and RAG context
        // Formatted strictly for smaller models like llava/llama3 to understand without hallucinating
        const systemPrompt = `You are "SkillSet AI", a highly intelligent assistant for the SkillSet India Government Portal. 
Your goal is to help administrators manage courses, analyze job market trends, and navigate the platform. 

CURRENT PORTAL LIVE STATS:
- Total Jobs Posted: ${totalJobs}
- Total Registered Users: ${totalUsers}
- Total Registered Companies: ${totalCompanies}

INSTRUCTIONS:
1. Keep your answers professional, concise, and helpful.
2. If asked about portal statistics, use the LIVE STATS provided above.
3. Use Markdown (bolding, lists) to format your response clearly.`;
        
        contents.unshift({ role: 'user', parts: [{ text: systemPrompt }] });
        contents.unshift({ role: 'model', parts: [{ text: 'Understood. I am SkillSet AI. I have memorized the live stats and will assist you professionally.' }] });

        // Generate response using conversational engine
        const answer = await generateChatResponse(contents, "I'm sorry, I am currently unable to process your request. Please check if Ollama is running.");
        
        // If the service explicitly returned our custom Ollama error string, mark it as failure
        if (answer.includes("Ollama Connection Failed")) {
            return res.status(503).json({ success: false, answer: answer });
        }

        res.json({ success: true, answer });
    } catch (error) {
        console.error("Smart Assistant Error:", error);
        res.status(500).json({ success: false, answer: "An internal error occurred." });
    }
};
