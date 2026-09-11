import NodeCache from 'node-cache';

// Initialize cache with default TTL of 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Middleware for caching API responses.
 * @param {number} duration - Time to live in seconds
 */
export const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        // Construct a unique key based on the URL and optionally the user/institute ID
        // to prevent cross-account data leakage.
        let key = req.originalUrl;
        
        if (req.institute && req.institute._id) {
            key = `${req.institute._id}-${req.originalUrl}`;
        } else if (req.auth && req.auth.userId) {
            key = `${req.auth.userId}-${req.originalUrl}`;
        }

        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            return res.json(cachedResponse);
        } else {
            // Override res.json to capture the response body and cache it
            const originalJson = res.json;
            res.json = (body) => {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cache.set(key, body, duration);
                }
                originalJson.call(res, body);
            };
            next();
        }
    };
};

/**
 * Clear cache for a specific key or prefix
 */
export const clearCache = (keyPrefix) => {
    const keys = cache.keys();
    const keysToDelete = keys.filter(k => k.includes(keyPrefix));
    if (keysToDelete.length > 0) {
        cache.del(keysToDelete);
    }
};

export default cache;
