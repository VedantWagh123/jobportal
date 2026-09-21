import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Create a single shared Redis connection for BullMQ
let redisOptions = {
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    family: 4, // Force IPv4 to fix ETIMEDOUT on some networks
    retryStrategy: (times) => Math.max(Math.min(Math.exp(times), 20000), 1000),
    reconnectOnError: (err) => err.message.includes("ECONNRESET")
};

if (process.env.REDIS_URL) {
    // Strip quotes, newlines, and hidden characters
    let rawUrl = process.env.REDIS_URL.replace(/['"\n\r\t]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
    
    // Debug log to see exact characters if it fails (using hex to avoid printing raw password)
    console.log("[Redis] REDIS_URL length:", rawUrl.length);
    
    try {
        const parsedUrl = new URL(rawUrl);
        redisOptions.host = parsedUrl.hostname;
        redisOptions.port = parsedUrl.port ? parseInt(parsedUrl.port) : 6379;
        if (parsedUrl.username) redisOptions.username = parsedUrl.username;
        if (parsedUrl.password) redisOptions.password = parsedUrl.password;
        
        if (rawUrl.startsWith('rediss://')) {
            redisOptions.tls = { rejectUnauthorized: false };
        }
    } catch (e) {
        console.error("[Redis Error] URL Parsing failed! Error:", e.message);
        // Do not crash here, let it try to connect so we can see the logs
    }
}

// Pass a SINGLE object to IORedis to avoid constructor signature bugs
const sharedRedisConnection = new IORedis(redisOptions);

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
