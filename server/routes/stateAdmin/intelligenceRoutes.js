import express from 'express';
import { protectAdmin } from '../../middleware/adminAuthMiddleware.js';
import {
    getIntelligenceOverview,
    getDashboardAnalytics,
    getDemandIntelligence,
    getSupplyIntelligence,
    getGapIntelligence,
    getDistrictIntelligence,
    runWhatIfSimulation
} from '../../controllers/adminIntelligenceController.js';
import { getStatePlacementInsights } from '../../controllers/feedbackController.js';
import { getInstituteById } from '../../controllers/adminInstituteController.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/institute/:id', getInstituteById);
router.get('/dashboard', getDashboardAnalytics);
router.get('/overview', getIntelligenceOverview);
router.get('/demand', getDemandIntelligence);
router.get('/supply', getSupplyIntelligence);
router.get('/gap', getGapIntelligence);
router.get('/districts', getDistrictIntelligence);
router.post('/simulate', runWhatIfSimulation);
router.get('/placement-insights', getStatePlacementInsights);


export default router;
