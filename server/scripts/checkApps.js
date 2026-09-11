import 'dotenv/config';
import connectDB from './config/db.js';
import JobApplication from './models/JobApplication.js';
import Job from './models/Job.js';
import User from './models/User.js';

const checkApps = async () => {
    try {
        await connectDB();
        const apps = await JobApplication.find({})
            .sort({ date: -1 })
            .populate('userId', 'name image resume')
            .populate('jobId', 'title location category level salary')
            .exec();
            
        console.log("Total applications:", apps.length);
        if (apps.length > 0) {
            console.log("Latest app:", JSON.stringify(apps[0], null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

checkApps();
