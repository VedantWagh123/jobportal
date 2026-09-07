import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import TrainingInstitute from './models/TrainingInstitute.js';

dotenv.config();

const cleanDb = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`);
        console.log('Connected to DB');

        const insts = await TrainingInstitute.find({ name: { $ne: 'khamza institute of tecnology' } });
        console.log('Found other institutes:', insts.map(i => i.name));

        for (const inst of insts) {
            const courses = await Course.find({ instituteId: inst._id });
            for (const c of courses) {
                console.log('Deleting course:', c.name);
                await Course.findByIdAndDelete(c._id);
            }
            console.log('Deleting institute:', inst.name);
            await TrainingInstitute.findByIdAndDelete(inst._id);
        }

        // Add Python to DATA SCIENCE course of khamza
        const myInst = await TrainingInstitute.findOne({ name: 'khamza institute of tecnology' });
        if (myInst) {
            const dsCourse = await Course.findOne({ instituteId: myInst._id, name: 'DATA SCIENCE' });
            if (dsCourse) {
                // Find or create Python skill
                const Skill = (await import('./models/Skill.js')).default;
                const CourseSkill = (await import('./models/CourseSkill.js')).default;
                
                let pythonSkill = await Skill.findOne({ name: { $regex: new RegExp(`^python$`, 'i') } });
                if (!pythonSkill) {
                    pythonSkill = await Skill.create({ name: 'python' });
                }
                
                const exists = await CourseSkill.findOne({ courseId: dsCourse._id, skillId: pythonSkill._id });
                if (!exists) {
                    await CourseSkill.create({ courseId: dsCourse._id, skillId: pythonSkill._id, proficiencyTaught: 'Intermediate' });
                    console.log('Added python skill to DATA SCIENCE course!');
                }
            }
        }

        console.log('Done');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanDb();
