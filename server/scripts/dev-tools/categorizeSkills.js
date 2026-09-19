import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import Skill from './models/Skill.js';
import connectDB from './config/db.js';

dotenv.config();

const categorizeSkills = async () => {
    try {
        await connectDB();
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const skills = await Skill.find({});
        console.log(`Found ${skills.length} skills to categorize...`);
        
        const skillNames = skills.map(s => s.name);
        
        const prompt = `
        You are an AI for a Job Portal. I will give you a list of skills.
        Classify each skill strictly into one of two categories: "Technical Skill" or "Soft Skill".
        
        Technical Skills include: Programming languages, frameworks, tools, software, hard skills (e.g., React, Plumber, Welding, Data Analysis).
        Soft Skills include: Communication, Teamwork, Problem Solving, Leadership, Time Management, etc.
        
        Respond ONLY with a valid JSON object where the key is the skill name and the value is the category.
        
        Skills:
        ${JSON.stringify(skillNames)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const classifications = JSON.parse(jsonStr);

        let updated = 0;
        for (const skill of skills) {
            const cat = classifications[skill.name];
            if (cat === "Technical Skill" || cat === "Soft Skill") {
                skill.category = cat;
                await skill.save();
                updated++;
            } else if (cat) {
                 skill.category = "Technical Skill"; // fallback
                 await skill.save();
                 updated++;
            }
        }
        
        console.log(`Successfully updated ${updated} skills!`);
        process.exit(0);
    } catch (error) {
        console.error("Failed to categorize:", error);
        process.exit(1);
    }
};

categorizeSkills();
