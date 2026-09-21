import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Create a single shared Redis connection for BullMQ
let connectionOptions = { host: 'localhost', port: 6379 };
let tlsOptions = undefined;

if (process.env.REDIS_URL) {
    // Strip quotes, whitespace, and ANY hidden/non-ASCII characters that copy-pasting might have added
    let rawUrl = process.env.REDIS_URL.replace(/['"]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
    
    try {
        const parsedUrl = new URL(rawUrl);
        connectionOptions = {
            host: parsedUrl.hostname,
            port: parsedUrl.port ? parseInt(parsedUrl.port) : 6379,
            username: parsedUrl.username || 'default',
            password: parsedUrl.password,
        };
        if (rawUrl.startsWith('rediss://')) {
            tlsOptions = { rejectUnauthorized: false };
        }
    } catch (e) {
        console.error("[Redis Error] Failed to parse REDIS_URL, falling back to raw string. Error:", e.message);
        connectionOptions = rawUrl;
        if (rawUrl.startsWith('rediss://')) tlsOptions = { rejectUnauthorized: false };
    }
}

// Add prefix to avoid collision if user is sharing a Redis instance across projects
const sharedRedisConnection = new IORedis(connectionOptions, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    family: 4, // Force IPv4 to fix ETIMEDOUT on some networks
    tls: tlsOptions,
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
