import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Create a single shared Redis connection for BullMQ
let connectionOptions = process.env.REDIS_URL || {
    host: 'localhost',
    port: 6379
};

// Add prefix to avoid collision if user is sharing a Redis instance across projects
const sharedRedisConnection = new IORedis(connectionOptions, {
    maxRetriesPerRequest: null
});

sharedRedisConnection.on('error', (err) => {
    console.error('[Redis Error] Connection failed. Is Redis running or REDIS_URL correct?', err.message);
});

// Create the Queue
// The 'jobportal:' prefix from IORedis is applied globally
export const aiQueue = new Queue('ai-parsing-queue', { 
    connection: sharedRedisConnection,
    prefix: 'jobportal',
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000 // 1s, 2s, 4s...
        }
    }
});

console.log('[Queue] BullMQ ai-parsing-queue initialized.');

// Export connection to be reused by workers
export { sharedRedisConnection };
