import { GoogleGenAI } from '@google/genai';
import Job from '../models/Job.js';
import Course from '../models/Course.js';
import CurriculumAlert from '../models/CurriculumAlert.js';

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

        // 4. Call Gemini API
        if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const responseText = response.text;
        
        // Clean JSON string (remove markdown ticks if present)
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
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
        if (!process.env.GEMINI_API_KEY) {
            console.warn("[Gemini] API Key missing. Using fallback.");
            return fallback;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("[Gemini] API Error:", error.message);
        return fallback;
    }
};
