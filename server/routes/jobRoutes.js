import express from 'express'
import { getJobById, getJobs } from '../controllers/jobController.js';

import { cacheMiddleware } from '../utils/cache.js';

const router = express.Router()

// Route to get all jobs data with 5 minutes cache
router.get('/', cacheMiddleware(300), getJobs)

// Route to get a single job by ID
router.get('/:id', getJobById)


export default router;