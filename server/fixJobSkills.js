import 'dotenv/config';
import connectDB from './config/db.js';
import Job from './models/Job.js';
import Skill from './models/Skill.js';
import JobSkill from './models/JobSkill.js';

const jobSkillMap = {
    "software engineer": ["java", "python", "sql", "javascript"],
    "backend developer": ["node.js", "express", "mongodb", "java", "sql databases"],
    "frontend developer": ["react", "javascript", "html", "css"],
    "data analyst": ["python", "data analysis", "sql", "pandas"],
    "data entry operator": ["typing skills", "excel", "fast typing"],
    "data entry professional": ["typing skills", "excel", "fast typing"],
    "graphic designer": ["photoshop", "illustrator", "ui/ux design"],
    "accountant": ["accounting", "excel", "tally"],
    "hr executive": ["recruitment", "communication", "human resources"],
    "sales manager": ["sales", "communication", "negotiation"],
    "delivery partner": ["driving", "time management"]
};

const defaultSkills = ["communication", "teamwork", "problem solving"];

const fixSkills = async () => {
    try {
        await connectDB();
        
        // 1. Clear all existing job skills
        await JobSkill.deleteMany({});
        console.log("Cleared existing JobSkills.");
        
        const jobs = await Job.find({});
        for (const job of jobs) {
            const title = job.title.toLowerCase().trim();
            let skillsToAssign = [];
            
            // Find mapping
            for (const [key, skills] of Object.entries(jobSkillMap)) {
                if (title.includes(key)) {
                    skillsToAssign = skills;
                    break;
                }
            }
            
            if (skillsToAssign.length === 0) {
                skillsToAssign = defaultSkills;
            }
            
            // Assign
            for (const skillName of skillsToAssign) {
                // Ensure skill exists in DB
                let skillDoc = await Skill.findOne({ name: { $regex: new RegExp(`^${skillName}$`, "i") } });
                if (!skillDoc) {
                    skillDoc = await Skill.create({ name: skillName.toLowerCase(), aliases: [skillName.toLowerCase()], category: 'Uncategorized' });
                }
                
                await JobSkill.create({
                    jobId: job._id,
                    skillId: skillDoc._id,
                    proficiency: 'Intermediate',
                    isCore: true
                });
            }
            console.log(`Assigned skills to ${job.title}: ${skillsToAssign.join(', ')}`);
        }
        
        console.log("Fixed all job skills.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

fixSkills();
