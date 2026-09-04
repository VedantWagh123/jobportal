import 'dotenv/config';
import connectDB from './config/db.js';
import Job from './models/Job.js';

const run = async () => {
    await connectDB();
    const jobs = await Job.find({});
    jobs.forEach(j => console.log(j.title));
    process.exit(0);
};
run();
