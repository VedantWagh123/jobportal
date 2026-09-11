import 'dotenv/config';
import connectDB from './config/db.js';
import Job from './models/Job.js';
import Skill from './models/Skill.js';
import JobSkill from './models/JobSkill.js';

const assignSkills = async () => {
    try {
        await connectDB();
        
        // Let's create some dummy skills if they don't exist
        const dummySkillNames = ['Typing Skills', 'Python', 'React', 'Communication', 'Project Management', 'Data Analysis', 'Excel'];
        const skillDocs = [];
        for (const name of dummySkillNames) {
            let skill = await Skill.findOne({ name });
            if (!skill) {
                skill = await Skill.create({ name, aliases: [name.toLowerCase()], category: 'Uncategorized' });
            }
            skillDocs.push(skill);
        }

        const jobs = await Job.find({});
        console.log(`Found ${jobs.length} jobs.`);
        
        for (const job of jobs) {
            // Check if it already has skills
            const existing = await JobSkill.find({ jobId: job._id });
            if (existing.length === 0) {
                // Assign 3 random skills
                const shuffled = [...skillDocs].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 3);
                
                // If the job is "Data Entry Operator", ensure "Typing Skills" and "Excel" are there
                if (job.title.toLowerCase().includes('data entry')) {
                    const typingSkill = skillDocs.find(s => s.name === 'Typing Skills');
                    const excelSkill = skillDocs.find(s => s.name === 'Excel');
                    
                    await JobSkill.findOneAndUpdate({ jobId: job._id, skillId: typingSkill._id }, { proficiency: 'Intermediate', isCore: true }, { upsert: true });
                    await JobSkill.findOneAndUpdate({ jobId: job._id, skillId: excelSkill._id }, { proficiency: 'Intermediate', isCore: true }, { upsert: true });
                } else {
                    for (const s of selected) {
                        await JobSkill.create({
                            jobId: job._id,
                            skillId: s._id,
                            proficiency: 'Unspecified',
                            isCore: true
                        });
                    }
                }
            }
        }

        console.log("Dummy skills assigned to jobs!");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

assignSkills();
