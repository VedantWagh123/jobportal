import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from './config/db.js';
import GovernmentAdmin from './models/GovernmentAdmin.js';

dotenv.config();

const run = async () => {
    try {
        await connectDB();
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        await GovernmentAdmin.deleteMany({ email: 'api_tester@gov.in' });
        await GovernmentAdmin.create({
            name: 'API Tester',
            email: 'api_tester@gov.in',
            passwordHash,
            role: 'government_admin',
            scope: 'national',
            isActive: true
        });

        console.log("Successfully created api_tester@gov.in with password: password123");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

run();
