import connectDB from './config/db.js';
import GovernmentAdmin from './models/GovernmentAdmin.js';
import { protectAdmin } from './middleware/adminAuthMiddleware.js';
import { createDistrict } from './controllers/adminDistrictController.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const createMockRes = (name) => {
    return {
        status: (code) => {
            return {
                json: (data) => console.log(`[${name} Status ${code}]:`, data)
            };
        },
        json: (data) => console.log(`[${name} Response]:`, data)
    };
};

const runTests = async () => {
    await connectDB();
    console.log("Connected to DB for testing Admin APIs.");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    await GovernmentAdmin.deleteMany({ email: 'api_tester@gov.in' });
    const admin = await GovernmentAdmin.create({
        name: 'API Tester',
        email: 'api_tester@gov.in',
        passwordHash,
        role: 'government_admin',
        scope: 'national',
        isActive: true
    });

    console.log("\n--- TEST 1: Unauthenticated request rejected ---");
    let req = { headers: {} };
    let res = createMockRes('TEST 1 (Missing Token)');
    await protectAdmin(req, res, () => {
        console.log("ERROR: Should not have called next()");
    });

    console.log("\n--- TEST 2: Create District (Authenticated) ---");
    req = { 
        admin, 
        body: { name: 'Test District ' + Date.now(), state: 'Maharashtra', country: 'India' } 
    };
    res = createMockRes('TEST 2');
    await createDistrict(req, res);

    console.log("\n--- TEST 3: Duplicate District Rejected ---");
    // Reuse the exact same request to force a duplicate key error
    res = createMockRes('TEST 3');
    await createDistrict(req, res);

    console.log("\nTests finished.");
    process.exit(0);
};

runTests();
