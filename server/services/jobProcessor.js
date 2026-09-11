import { Worker } from 'bullmq';
import { sharedRedisConnection } from '../config/queue.js';
import { parseJobDescription } from './aiService.js';
import Job from '../models/Job.js';

export const startJobProcessor = () => {
    console.log("[Job Processor] Starting BullMQ Worker on ai-parsing-queue...");

    const worker = new Worker('ai-parsing-queue', async (job) => {
        const { jobId, title, description } = job.data;
        console.log(`[Job Processor] BullMQ picked up Job ID: ${jobId}`);
        
        // Pass to aiService for extraction
        await parseJobDescription(jobId, title, description);
        
    }, { 
        connection: sharedRedisConnection,
        prefix: 'jobportal',
        concurrency: 2 // Process up to 2 jobs simultaneously
    });

    worker.on('completed', job => {
        console.log(`[Job Processor] Job ${job.id} completed successfully!`);
    });

    worker.on('failed', async (job, err) => {
        console.error(`[Job Processor] Job ${job.id} failed with error:`, err.message);
        // BullMQ will automatically retry based on the queue settings in config/queue.js
    });

    // Cleanup legacy pending jobs (for jobs created before Redis was added)
    // Run this once on boot just in case
    cleanupLegacyJobs();
};

const cleanupLegacyJobs = async () => {
    try {
        const jobs = await Job.find({ intelligenceStatus: 'Pending' });
        if (jobs.length > 0) {
            console.log(`[Job Processor] Found ${jobs.length} legacy pending jobs. Migrating to Redis queue...`);
            const { aiQueue } = await import('../config/queue.js');
            for (const job of jobs) {
                await aiQueue.add('parse-job', { 
                    jobId: job._id, 
                    title: job.title, 
                    description: job.description 
                });
            }
        }
    } catch (e) {
        console.error("Failed to cleanup legacy jobs", e);
    }
}
