import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './models/Job.js';
import Skill from './models/Skill.js';
import JobSkill from './models/JobSkill.js';
import District from './models/District.js';
import Company from './models/Company.js';
import TrainingInstitute from './models/TrainingInstitute.js';
import Course from './models/Course.js';
import CourseSkill from './models/CourseSkill.js';
import TrainingBatch from './models/TrainingBatch.js';
import IntelligenceService from './services/intelligenceService.js';

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Cleanup previous test data
        await Job.deleteMany({ title: "Test Job React" });
        await Skill.deleteMany({ name: "React Test Skill" });
        await District.deleteMany({ name: "Test District" });
        await Company.deleteMany({ name: "Test Company" });
        await TrainingInstitute.deleteMany({ name: "Test Institute" });
        await Course.deleteMany({ name: "Test React Course" });
        await JobSkill.deleteMany({});
        await CourseSkill.deleteMany({});
        await TrainingBatch.deleteMany({ batchName: "Test Batch React" });

        console.log("Cleaned up old test data.");

        // 1. Create District
        const district = await District.create({ name: "Test District", state: "Maharashtra" });

        // 2. Create Company
        const company = await Company.create({ name: "Test Company", email: "test@co.com", password: "123", image: "dummy.png" });

        // 3. Create Skill
        const skill = await Skill.create({ name: "React Test Skill", category: "Framework" });

        // 4. DEMAND: Create 10 Jobs requiring React
        console.log("Creating 10 jobs requiring React...");
        for (let i = 0; i < 10; i++) {
            const job = await Job.create({
                title: "Test Job React",
                description: "React dev needed",
                location: "Test Location",
                districtId: district._id,
                category: "Programming",
                level: "Beginner",
                salary: 50000,
                date: Date.now(),
                companyId: company._id
            });
            await JobSkill.create({
                jobId: job._id,
                skillId: skill._id,
                proficiency: "Beginner"
            });
        }

        // 5. SUPPLY: Create Institute, Course, and a Batch with 20 capacity mapped to React
        console.log("Creating training supply with 20 seats for React...");
        const institute = await TrainingInstitute.create({
            name: "Test Institute",
            email: "inst@test.com",
            password: "123",
            districtId: district._id
        });

        const course = await Course.create({
            instituteId: institute._id,
            name: "Test React Course",
            durationMonths: 3
        });

        await CourseSkill.create({
            courseId: course._id,
            skillId: skill._id,
            proficiencyTaught: "Beginner"
        });

        await TrainingBatch.create({
            courseId: course._id,
            instituteId: institute._id,
            batchName: "Test Batch React",
            capacity: 20,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            status: "Upcoming"
        });

        // 6. RUN AGGREGATION
        console.log("\n--- RUNNING INTELLIGENCE SERVICE ---");
        const gapData = await IntelligenceService.getGapIntelligence();
        
        // Find our test skill
        const result = gapData.find(g => g.skillId.toString() === skill._id.toString());
        
        console.log("TEST RESULT:");
        console.log(result);

        if (result.demand === 10 && result.supply === 20 && result.gap === -10 && result.status === 'Oversupply') {
            console.log("✅ TEST PASSED: Demand 10, Supply 20 -> Gap -10 (Oversupply)");
        } else {
            console.error("❌ TEST FAILED");
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

runTest();
