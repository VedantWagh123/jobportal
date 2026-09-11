import 'dotenv/config';
import connectDB from './config/db.js';
import IntelligenceService from './services/intelligenceService.js';

const testDashboard = async () => {
    try {
        await connectDB();
        const data = await IntelligenceService.getDashboardAnalytics();
        console.log(JSON.stringify(data, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

testDashboard();
