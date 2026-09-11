import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import GovernmentAdmin from './models/GovernmentAdmin.js';
import SuperAdmin from './models/SuperAdmin.js';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const stateAdmins = await GovernmentAdmin.find({});
        console.log("\n--- STATE ADMINS (GovernmentAdmin) ---");
        stateAdmins.forEach(admin => console.log(`Email: ${admin.email}, State: ${admin.state}`));

        const superAdmins = await SuperAdmin.find({});
        console.log("\n--- SUPER ADMINS ---");
        superAdmins.forEach(admin => console.log(`Email: ${admin.email}`));

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

run();
