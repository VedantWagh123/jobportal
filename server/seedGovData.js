import 'dotenv/config';
import connectDB from './config/db.js';
import District from './models/District.js';
import TrainingInstitute from './models/TrainingInstitute.js';
import Course from './models/Course.js';
import CourseSkill from './models/CourseSkill.js';
import Batch from './models/TrainingBatch.js';
import User from './models/User.js';
import Enrollment from './models/Enrollment.js';
import Skill from './models/Skill.js';

import bcrypt from 'bcrypt';

const seedGovData = async () => {
    try {
        await connectDB();
        console.log("Connected to DB, starting government data seed...");

        // 1. Seed Districts
        const districtNames = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"];
        const districts = [];
        for (let name of districtNames) {
            let d = await District.findOne({ name });
            if (!d) {
                d = await District.create({ name, state: 'Default State' });
                console.log(`Created District: ${name}`);
            }
            districts.push(d);
        }

        // 2. Seed Institutes
        const instituteNames = ["National Skill Institute", "Tech Gurukul", "Healthcare Academy", "Construction Workers Training Center", "Modern IT Institute"];
        const institutes = [];
        for (let i = 0; i < instituteNames.length; i++) {
            let inst = await TrainingInstitute.findOne({ name: instituteNames[i] });
            if (!inst) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('password123', salt);
                inst = await TrainingInstitute.create({
                    name: instituteNames[i],
                    districtId: districts[i % districts.length]._id,
                    address: `${instituteNames[i]} Main Road, ${districts[i % districts.length].name}`,
                    contactNumber: `987654321${i}`,
                    email: `contact@${instituteNames[i].replace(/\s/g, '').toLowerCase()}.gov.in`,
                    password: hashedPassword,
                    type: 'Government',
                    accreditation: 'NSDC'
                });
                console.log(`Created Institute: ${instituteNames[i]}`);
            }
            institutes.push(inst);
        }

        // 3. Seed Courses
        const courseData = [
            { name: "Advanced MERN Stack Development", description: "Learn React, Node, Express, MongoDB", durationMonths: 6 },
            { name: "Data Analysis & Python", description: "Learn Python, Pandas, SQL", durationMonths: 4 },
            { name: "Certified Welder Training", description: "Industrial welding techniques", durationMonths: 3 },
            { name: "Healthcare Assistant Training", description: "Basic nursing and patient care", durationMonths: 6 },
            { name: "Digital Marketing Masterclass", description: "SEO, SEM, Social Media Marketing", durationMonths: 2 }
        ];
        const courses = [];
        for (let i = 0; i < courseData.length; i++) {
            let c = await Course.findOne({ name: courseData[i].name });
            if (!c) {
                c = await Course.create({
                    instituteId: institutes[i % institutes.length]._id,
                    name: courseData[i].name,
                    description: courseData[i].description,
                    durationMonths: courseData[i].durationMonths,
                    isActive: true
                });
                console.log(`Created Course: ${courseData[i].name}`);
            }
            courses.push(c);
        }

        // 4. Seed Course Skills
        const skillsData = [
            { courseIndex: 0, skills: ["databases", "react", "node js", "express", "mongodb", "software development practices"] },
            { courseIndex: 1, skills: ["python", "sql", "data analysis", "pandas"] },
            { courseIndex: 2, skills: ["welding", "safety protocols", "metalwork"] },
            { courseIndex: 3, skills: ["patient care", "first aid", "cpr", "medical terminology"] },
            { courseIndex: 4, skills: ["seo", "digital marketing", "social media", "communication"] }
        ];

        for (let data of skillsData) {
            const course = courses[data.courseIndex];
            for (let skillName of data.skills) {
                let skillObj = await Skill.findOne({ name: skillName });
                if (!skillObj) {
                    skillObj = await Skill.create({ name: skillName });
                }
                const existingSkill = await CourseSkill.findOne({ courseId: course._id, skillId: skillObj._id });
                if (!existingSkill) {
                    await CourseSkill.create({
                        courseId: course._id,
                        skillId: skillObj._id,
                        proficiencyTaught: "Intermediate"
                    });
                }
            }
            console.log(`Created Skills for Course: ${course.name}`);
        }

        // 5. Seed Batches
        const batches = [];
        for (let i = 0; i < 10; i++) {
            const randomCourse = courses[Math.floor(Math.random() * courses.length)];
            const randomInstitute = institutes[Math.floor(Math.random() * institutes.length)];
            
            const batch = await Batch.create({
                batchName: `${randomCourse.name} - Batch 2026`,
                courseId: randomCourse._id,
                instituteId: randomInstitute._id,
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
                capacity: 30,
                status: 'Ongoing'
            });
            batches.push(batch);
            console.log(`Created Batch for ${randomCourse.name} at ${randomInstitute.name}`);
        }

        // 6. Seed Enrollments
        // We will try to find an existing user or create a dummy user to enroll.
        let defaultUser = await User.findOne({}); // Grab any user (e.g. the one the user is logged in as)
        if (!defaultUser) {
            defaultUser = await User.create({
                name: "Test Candidate",
                email: "test@candidate.com",
                image: "https://via.placeholder.com/150",
                resume: "dummy.pdf"
            });
        }

        for (let i = 0; i < 5; i++) {
            const randomBatch = batches[Math.floor(Math.random() * batches.length)];
            
            // Avoid duplicate enrollments
            const existingEnrollment = await Enrollment.findOne({ userId: defaultUser._id, batchId: randomBatch._id });
            if (!existingEnrollment) {
                await Enrollment.create({
                    userId: defaultUser._id,
                    batchId: randomBatch._id,
                    enrollmentDate: new Date(),
                    status: 'Enrolled'
                });
                console.log(`Enrolled User in Batch: ${randomBatch._id}`);
            }
        }

        console.log("Government Ecosystem Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding gov data:", error);
        process.exit(1);
    }
};

seedGovData();
