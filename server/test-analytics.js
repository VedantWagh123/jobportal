import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getIntelligenceDashboard } from './controllers/adminAnalyticsController.js';

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Mock req and res
        const req = {};
        const res = {
            json: (data) => {
                console.log(JSON.stringify(data, null, 2));
            },
            status: (code) => ({
                json: (data) => console.log(`Status ${code}:`, data)
            })
        };

        await getIntelligenceDashboard(req, res);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

runTest();
