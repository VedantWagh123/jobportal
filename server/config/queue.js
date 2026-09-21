import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Create a single shared Redis connection for BullMQ
let redisUrl = process.env.REDIS_URL ? process.env.REDIS_URL.replace(/['"]/g, '').trim() : null;
let connectionOptions = redisUrl || {
    host: 'localhost',
    port: 6379
};

// Add prefix to avoid collision if user is sharing a Redis instance across projects
const sharedRedisConnection = new IORedis(connectionOptions, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    family: 4, // Force IPv4 to fix ETIMEDOUT on some networks
    tls: connectionOptions.includes('rediss://') ? { rejectUnauthorized: false } : undefined,
    // Robust retry strategy to fix Upstash ECONNRESET idle drops
    retryStrategy: (times) => {
        return Math.max(Math.min(Math.exp(times), 20000), 1000);
    },
    reconnectOnError: (err) => {
        const targetError = "ECONNRESET";
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    }
});

sharedRedisConnection.on('error', (err) => {
    // Ignore generic ECONNRESET logs in console as the retryStrategy handles them silently now
    if (err.code !== 'ECONNRESET') {
        console.error('[Redis Error] Connection failed:', err.message);
    }
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
