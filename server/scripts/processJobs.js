import 'dotenv/config';
import connectDB from './config/db.js';
import Job from './models/Job.js';
import { parseJobDescription } from './services/aiService.js';

const processJobs = async () => {
    try {
        await connectDB();
        const jobs = await Job.find({ 
            $or: [
                { intelligenceStatus: { $exists: false } },
                { intelligenceStatus: 'Pending' },
                { intelligenceStatus: 'Failed' }
            ]
        });

        console.log(`Found ${jobs.length} jobs to process.`);
        
        for (const job of jobs) {
            console.log(`Processing job: ${job.title}...`);
            await parseJobDescription(job._id, job.title, job.description);
            // Wait 2 seconds to avoid rate limits
            await new Promise(res => setTimeout(res, 2000));
        }

        console.log("All jobs processed.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

processJobs();
