import mongoose from 'mongoose';
import 'dotenv/config';
import UnresolvedSkill from './models/UnresolvedSkill.js';
import Skill from './models/Skill.js';
import JobSkill from './models/JobSkill.js';
import Job from './models/Job.js';
import Company from './models/Company.js';

// The controller functions are tied to Express (req, res), so we'll test the logic directly 
// or test via HTTP if the server is running. It's easier to just mock a req/res and call the controller.
import { getUnresolvedSkills, approveSkill, rejectSkill } from './controllers/adminSkillResolutionController.js';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database Connected for Testing");
    } catch (error) {
        console.error("DB Connection Error:", error);
        process.exit(1);
    }
}

// Mock Express res object
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const runTests = async () => {
    await connectDB();

    console.log("\n--- STARTING TESTS ---\n");

    try {
        // 1. Setup mock data
        console.log("1. Setting up mock data...");
        // Cleanup old tests
        await UnresolvedSkill.deleteMany({ rawName: { $regex: 'TestSkill' } });
        await Skill.deleteMany({ name: { $regex: 'testskill' } });

        const company = await Company.findOne();
        if (!company) {
             console.log("No company found, skipping job creation. Please create a company first.");
             process.exit(0);
        }

        const job = await Job.create({
            title: "Test Job for Skills",
            description: "Need TestSkill_1 and TestSkill_2",
            location: "Remote",
            level: "Beginner",
            salary: 50000,
            category: "Programming",
            companyId: company._id,
            date: Date.now()
        });

        const us1 = await UnresolvedSkill.create({
            rawName: "TestSkill_1",
            normalizedName: "testskill_1",
            confidence: 90,
            jobId: job._id
        });

        const us2 = await UnresolvedSkill.create({
            rawName: "TestSkill_2",
            normalizedName: "testskill_2",
            confidence: 85,
            jobId: job._id
        });

        console.log("Mock data created successfully.\n");

        // 2. Test getUnresolvedSkills
        console.log("2. Testing GET Unresolved Skills...");
        let req = { query: { status: 'pending', search: 'TestSkill' } };
        let res = mockRes();
        await getUnresolvedSkills(req, res);
        
        if (res.data.success && res.data.total >= 2) {
            console.log("✅ GET Unresolved Skills Passed. Found:", res.data.total);
        } else {
            console.error("❌ GET Unresolved Skills Failed", res.data);
        }

        // 3. Test approveSkill
        console.log("\n3. Testing Approve Skill (creates new Skill Master)...");
        req = { params: { id: us1._id.toString() } };
        res = mockRes();
        await approveSkill(req, res);

        if (res.data.success && res.data.skill) {
            console.log("✅ Approve Skill Passed. Created Skill:", res.data.skill.name);
            
            // Check JobSkill mapping
            const js = await JobSkill.findOne({ jobId: job._id, skillId: res.data.skill._id });
            if (js) {
                console.log("✅ JobSkill automatically linked!");
            } else {
                console.error("❌ JobSkill not linked!");
            }

            // Check UnresolvedSkill status
            const updatedUS = await UnresolvedSkill.findById(us1._id);
            if (updatedUS.status === 'reviewed') {
                 console.log("✅ UnresolvedSkill status changed to reviewed!");
            } else {
                 console.error("❌ UnresolvedSkill status NOT changed!");
            }

        } else {
            console.error("❌ Approve Skill Failed", res.data);
        }

        // 4. Test duplicate approve prevention
        console.log("\n4. Testing Duplicate Protection (Approve same skill again)...");
        req = { params: { id: us1._id.toString() } };
        res = mockRes();
        await approveSkill(req, res);
        
        if (!res.data.success && res.statusCode === 400) {
            console.log("✅ Correctly rejected double approval!");
        } else {
            console.error("❌ Failed to block double approval", res.data);
        }

        // 5. Test rejectSkill
        console.log("\n5. Testing Reject Skill...");
        req = { params: { id: us2._id.toString() } };
        res = mockRes();
        await rejectSkill(req, res);

        if (res.data.success) {
            console.log("✅ Reject Skill API Passed");
            const rejectedUS = await UnresolvedSkill.findById(us2._id);
            if (rejectedUS.status === 'rejected') {
                console.log("✅ Skill status correctly changed to rejected!");
            } else {
                console.error("❌ Skill status NOT changed to rejected!");
            }
        } else {
            console.error("❌ Reject Skill Failed", res.data);
        }

        console.log("\n--- TESTS COMPLETED SUCCESSFULLY ---");

    } catch (err) {
        console.error("Test execution failed:", err);
    } finally {
        // Cleanup
        await Job.deleteMany({ title: "Test Job for Skills" });
        await UnresolvedSkill.deleteMany({ rawName: { $regex: 'TestSkill' } });
        await Skill.deleteMany({ name: { $regex: 'testskill' } });
        mongoose.disconnect();
    }
}

runTests();
