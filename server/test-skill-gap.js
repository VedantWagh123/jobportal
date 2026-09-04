import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SkillGapService from './services/skillGapService.js';
import Skill from './models/Skill.js';
import Job from './models/Job.js';
import JobSkill from './models/JobSkill.js';
import Course from './models/Course.js';
import CourseSkill from './models/CourseSkill.js';
import TrainingInstitute from './models/TrainingInstitute.js';
import District from './models/District.js';
import Company from './models/Company.js';

dotenv.config();

const runTests = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Initial Cleanup
        await District.deleteMany({ name: 'Test District' });
        await TrainingInstitute.deleteMany({ email: 'test@inst.com' });
        await Skill.deleteMany({ name: { $in: ['TestSkill1', 'TestSkill2', 'TestSkill3', 'Databases', 'JavaScript', 'C', 'C++', 'Java', 'React', 'React Native', 'Node.js'] } });
        await Job.deleteMany({ title: 'Test Job' });
        await Course.deleteMany({ name: 'Test Course (S1+S2)' });

        // Create Dummy Data
        const testDistrict = await District.create({ name: 'Test District', state: 'Test State' });
        
        const institute = await TrainingInstitute.create({
            name: 'Test Institute',
            email: 'test@inst.com',
            password: 'pass',
            districtId: testDistrict._id,
            adminId: new mongoose.Types.ObjectId()
        });

        const s1 = await Skill.create({ name: 'TestSkill1', category: 'Testing' });
        const s2 = await Skill.create({ name: 'TestSkill2', category: 'Testing' });
        const s3 = await Skill.create({ name: 'TestSkill3', category: 'Testing' });

        // Add skills for specific normalization tests
        await Skill.create([
            { name: 'Databases' },
            { name: 'JavaScript' },
            { name: 'C' },
            { name: 'C++' },
            { name: 'Java' },
            { name: 'React' },
            { name: 'React Native' },
            { name: 'Node.js' }
        ]);

        const job = await Job.create({
            title: 'Test Job',
            description: 'Test',
            location: 'Remote',
            category: 'Testing',
            level: 'Junior',
            salary: 50000,
            date: Date.now(),
            companyId: new mongoose.Types.ObjectId()
        });

        await JobSkill.create([
            { jobId: job._id, skillId: s1._id, proficiencyLevel: 'Intermediate' },
            { jobId: job._id, skillId: s2._id, proficiencyLevel: 'Beginner' },
            { jobId: job._id, skillId: s3._id, proficiencyLevel: 'Expert' }
        ]);

        const course = await Course.create({
            name: 'Test Course (S1+S2)',
            instituteId: institute._id,
            durationMonths: 3,
            level: 'Beginner',
            isActive: true
        });

        await CourseSkill.create([
            { courseId: course._id, skillId: s1._id, proficiencyTaught: 'Intermediate' },
            { courseId: course._id, skillId: s2._id, proficiencyTaught: 'Beginner' }
        ]);

        console.log('\n--- Running Tests ---\n');

        // TEST 1: Candidate has all required skills
        console.log('TEST 1: Candidate has all required skills');
        let analysis = await SkillGapService.getCareerAnalysis(['TestSkill1', 'TestSkill2', 'TestSkill3'], job._id);
        console.assert(analysis.matchScore === 100, `Expected 100%, got ${analysis.matchScore}`);
        console.assert(analysis.missingSkills.length === 0, 'Expected 0 missing skills');
        console.log('✅ Passed\n');

        // TEST 2: Candidate has partial skills
        console.log('TEST 2: Candidate has partial skills');
        analysis = await SkillGapService.getCareerAnalysis(['TestSkill1'], job._id);
        console.assert(analysis.matchScore === 33, `Expected 33%, got ${analysis.matchScore}`);
        console.assert(analysis.missingSkills.length === 2, 'Expected 2 missing skills');
        console.log('✅ Passed\n');

        // TEST 3: Candidate has no skills
        console.log('TEST 3: Candidate has no skills');
        analysis = await SkillGapService.getCareerAnalysis([], job._id);
        console.assert(analysis.matchScore === 0, `Expected 0%, got ${analysis.matchScore}`);
        console.assert(analysis.missingSkills.length === 3, 'Expected 3 missing skills');
        console.log('✅ Passed\n');

        // TEST 6, 7, 8: Course recommendation
        console.log('TEST: Course Recommendation Logic');
        console.assert(analysis.recommendations.length > 0, 'Expected at least one recommendation');
        const rec = analysis.recommendations[0];
        console.assert(rec.courseName === 'Test Course (S1+S2)', 'Expected Test Course');
        console.assert(rec.coveredSkills.length === 2, 'Course covers 2 missing skills');
        console.log('✅ Passed\n');

        console.log('All backend tests passed successfully!');

        // TEST: Normalization and Aliases
        console.log('\n--- Testing Normalization & Aliases ---\n');
        
        const testNormalization = async (input, expectedMatch) => {
            const normalized = await SkillGapService.normalizeCandidateSkills([input]);
            const matchName = normalized.length > 0 ? normalized[0].name : null;
            if (matchName !== expectedMatch) {
                console.error(`❌ FAILED: '${input}' should match '${expectedMatch}', but got '${matchName}'`);
                process.exit(1);
            }
            console.log(`✅ Passed: '${input}' matched '${expectedMatch}'`);
        };

        await testNormalization('database', 'Databases');
        await testNormalization('DBMS', 'Databases');
        await testNormalization('SQL Database', 'Databases');
        await testNormalization('Java', 'Java'); // Should not match JavaScript
        await testNormalization('JavaScript', 'JavaScript');
        await testNormalization('C', 'C'); // Should not match C++
        await testNormalization('C++', 'C++');
        await testNormalization('React', 'React'); // Should not match React Native
        await testNormalization('JS', 'JavaScript');
        await testNormalization('NodeJS', 'Node.js');
        await testNormalization('React.js', 'React');
        await testNormalization('reactjs', 'React');

        // Cleanup
        await District.findByIdAndDelete(testDistrict._id);
        await TrainingInstitute.findByIdAndDelete(institute._id);
        await Skill.deleteMany({ name: { $in: ['TestSkill1', 'TestSkill2', 'TestSkill3', 'Databases', 'JavaScript', 'C', 'C++', 'Java', 'React', 'React Native', 'Node.js'] } });
        await Job.findByIdAndDelete(job._id);
        await JobSkill.deleteMany({ jobId: job._id });
        await Course.findByIdAndDelete(course._id);
        await CourseSkill.deleteMany({ courseId: course._id });

        mongoose.connection.close();
    } catch (e) {
        console.error('Test failed', e);
        process.exit(1);
    }
};

runTests();
