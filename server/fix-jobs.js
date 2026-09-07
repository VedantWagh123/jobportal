import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './models/Job.js';
import District from './models/District.js';

dotenv.config();

const fixJobs = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`);
        console.log('Connected to DB: job-portal');

        const jobs = await Job.find({ districtId: { $exists: false } });
        console.log(`Found ${jobs.length} jobs without districtId`);

        for (let job of jobs) {
            console.log(`Job ${job.title} has location: "${job.location}"`);
            if (job.location) {
                const dist = await District.findOne({ name: { $regex: new RegExp(`^${job.location.trim()}$`, 'i') } });
                if (dist) {
                    job.districtId = dist._id;
                    await job.save();
                    console.log(`Updated job ${job.title} with district ${dist.name}`);
                } else {
                    console.log(`No district found for ${job.location}`);
                }
            }
        }
        
        const nullJobs = await Job.find({ districtId: null });
        console.log(`Found ${nullJobs.length} jobs with null districtId`);
        for (let job of nullJobs) {
            console.log(`Null Job ${job.title} has location: "${job.location}"`);
            if (job.location) {
                const dist = await District.findOne({ name: { $regex: new RegExp(`^${job.location.trim()}$`, 'i') } });
                if (dist) {
                    job.districtId = dist._id;
                    await job.save();
                    console.log(`Updated null job ${job.title} with district ${dist.name}`);
                } else {
                    console.log(`No district found for null job ${job.location}`);
                }
            }
        }

        console.log('Done');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixJobs();
