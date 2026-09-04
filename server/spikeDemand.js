import 'dotenv/config';
import connectDB from './config/db.js';
import Job from './models/Job.js';
import Skill from './models/Skill.js';
import JobSkill from './models/JobSkill.js';
import Company from './models/Company.js';

const spikeDemand = async () => {
    try {
        await connectDB();
        
        // Find a company to post these jobs
        const company = await Company.findOne({});
        if (!company) throw new Error("No company found");

        // Find Python skill
        const pythonSkill = await Skill.findOne({ name: 'python' });
        if (!pythonSkill) throw new Error("Python skill not found");

        console.log("Adding 60 dummy jobs to spike Python demand...");

        for(let i = 0; i < 60; i++) {
            const job = await Job.create({
                companyId: company._id,
                title: `Senior Python Developer ${i}`,
                category: 'Software Engineering',
                location: 'Pune',
                salary: 1500000,
                jobType: 'Full-time',
                level: 'Senior level',
                description: 'Need urgent Python developers for AI project.',
                visible: true,
                intelligenceStatus: 'Completed',
                date: Date.now()
            });

            await JobSkill.create({
                jobId: job._id,
                skillId: pythonSkill._id,
                proficiency: 'Advanced',
                isCore: true
            });
        }

        console.log("Spike complete! Python demand increased by 60.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

spikeDemand();
