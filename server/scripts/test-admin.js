import connectDB from './config/db.js';
import GovernmentAdmin from './models/GovernmentAdmin.js';
import { loginAdmin, getAdminProfile } from './controllers/adminAuthController.js';
import { protectAdmin } from './middleware/adminAuthMiddleware.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

// Mock res object
const createMockRes = (name) => {
    return {
        json: (data) => console.log(`[${name} Response]:`, data)
    };
};

const runTests = async () => {
    await connectDB();
    console.log("Connected to DB for testing.");

    // Clean up
    await GovernmentAdmin.deleteMany({ email: { $in: ['test@gov.in', 'inactive@gov.in'] } });

    // Seed Data
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const activeAdmin = await GovernmentAdmin.create({
        name: 'Active Admin',
        email: 'test@gov.in',
        passwordHash,
        role: 'government_admin',
        scope: 'national',
        isActive: true
    });

    const inactiveAdmin = await GovernmentAdmin.create({
        name: 'Inactive Admin',
        email: 'inactive@gov.in',
        passwordHash,
        role: 'government_admin',
        scope: 'district',
        isActive: false
    });

    console.log("\n--- TEST 1: Valid Government Admin Login ---");
    let req = { body: { email: 'test@gov.in', password: 'password123' } };
    let res = createMockRes('TEST 1');
    await loginAdmin(req, res);

    console.log("\n--- TEST 2: Invalid password ---");
    req = { body: { email: 'test@gov.in', password: 'wrongpassword' } };
    res = createMockRes('TEST 2');
    await loginAdmin(req, res);

    console.log("\n--- TEST 3: Unknown email ---");
    req = { body: { email: 'unknown@gov.in', password: 'password123' } };
    res = createMockRes('TEST 3');
    await loginAdmin(req, res);

    console.log("\n--- TEST 4: Inactive admin ---");
    req = { body: { email: 'inactive@gov.in', password: 'password123' } };
    res = createMockRes('TEST 4');
    await loginAdmin(req, res);

    // Get a real token for the next tests
    let validToken = '';
    const tempRes = {
        json: (data) => { validToken = data.token; }
    };
    req = { body: { email: 'test@gov.in', password: 'password123' } };
    await loginAdmin(req, tempRes);

    console.log("\n--- TEST 5: Missing token ---");
    req = { headers: {} };
    res = createMockRes('TEST 5');
    await protectAdmin(req, res, () => {});

    console.log("\n--- TEST 6: Invalid token ---");
    req = { headers: { token: 'invalid_token_xyz' } };
    res = createMockRes('TEST 6');
    await protectAdmin(req, res, () => {});

    console.log("\n--- TEST 7: Valid token accessing /auth/me ---");
    req = { headers: { token: validToken } };
    res = createMockRes('TEST 7 (Middleware Error)');
    
    // Simulate next() behavior
    let nextCalled = false;
    await protectAdmin(req, res, () => {
        nextCalled = true;
    });
    
    if (nextCalled) {
        console.log("[TEST 7 Middleware]: Access Granted, calling controller...");
        res = createMockRes('TEST 7 (Profile)');
        await getAdminProfile(req, res);
    }

    console.log("\nTests finished.");
    process.exit(0);
};

runTests();
