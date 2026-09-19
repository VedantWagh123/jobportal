import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Skill from './models/Skill.js';
import connectDB from './config/db.js';

dotenv.config();

const checkSkills = async () => {
    try {
        await connectDB();
        
        const skills = await Skill.find({});
        console.log("Categories found:", [...new Set(skills.map(s => s.category))]);
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSkills();
