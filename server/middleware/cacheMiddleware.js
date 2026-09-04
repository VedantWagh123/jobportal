import NodeCache from 'node-cache';

// Initialize cache with a standard TTL of 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Caching middleware
 * @param {number} duration Cache duration in seconds (overrides default stdTTL)
 */
export const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate a unique cache key based on URL and query params
        // Also include user role/id if data is user-specific. 
        // For admin dashboard, token might be same role but let's cache based on URL.
        const key = `__express__${req.originalUrl || req.url}`;
        
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            console.log(`[Cache] HIT: ${key}`);
            return res.json(cachedResponse);
        } else {
            console.log(`[Cache] MISS: ${key}`);
            // Intercept res.json to store the response in cache
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                // Only cache successful responses
                if (body && body.success !== false) {
                    cache.set(key, body, duration);
                }
                originalJson(body);
            };
            next();
        }
    };
};
