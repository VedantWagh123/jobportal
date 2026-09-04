import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import {
    getIntelligenceOverview,
    getDashboardAnalytics,
    getDemandIntelligence,
    getSupplyIntelligence,
    getGapIntelligence,
    getDistrictIntelligence,
    runWhatIfSimulation
} from '../controllers/adminIntelligenceController.js';
import {
    getUnresolvedSkills,
    approveSkill,
    rejectSkill
} from '../controllers/adminSkillResolutionController.js';

const router = express.Router();

import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

router.use(protectAdmin);

router.get('/dashboard', cacheMiddleware(10), getDashboardAnalytics);
router.get('/overview', cacheMiddleware(300), getIntelligenceOverview);
router.get('/demand', cacheMiddleware(300), getDemandIntelligence);
router.get('/supply', cacheMiddleware(300), getSupplyIntelligence);
router.get('/gap', cacheMiddleware(300), getGapIntelligence);
router.get('/districts', cacheMiddleware(300), getDistrictIntelligence);
router.post('/simulate', runWhatIfSimulation);

// Unresolved Skills (Human-in-the-loop)
router.get('/unresolved-skills', getUnresolvedSkills);
router.post('/unresolved-skills/:id/approve', approveSkill);
router.post('/unresolved-skills/:id/reject', rejectSkill);

export default router;
