import express from 'express';
import { protectAdmin } from '../../middleware/adminAuthMiddleware.js';
import {
    getIntelligenceOverview,
    getDashboardAnalytics,
    getDemandIntelligence,
    getSupplyIntelligence,
    getGapIntelligence,
    getDistrictIntelligence,
    getDistrictDigitalTwin,
    getSkillIntelligence,
    getRegisteredStates,
    runWhatIfSimulation,
    getForecastIntelligence,
    generateForecastInsights,
    getSectorMatrix,
    getMigrationAnalysis,
    getActiveDistricts
} from '../../controllers/adminIntelligenceController.js';
import { getStatePlacementInsights } from '../../controllers/feedbackController.js';
import { getInstituteById } from '../../controllers/adminInstituteController.js';
import { cacheMiddleware } from '../../utils/cache.js';

const router = express.Router();

router.use(protectAdmin);

router.get('/institute/:id', getInstituteById);
router.get('/dashboard', cacheMiddleware(180), getDashboardAnalytics);
router.get('/overview', cacheMiddleware(180), getIntelligenceOverview);
router.get('/demand', cacheMiddleware(180), getDemandIntelligence);
router.get('/supply', cacheMiddleware(180), getSupplyIntelligence);
router.get('/gap', cacheMiddleware(180), getGapIntelligence);
router.get('/districts', cacheMiddleware(300), getDistrictIntelligence);
router.get('/district-twin/:districtId', cacheMiddleware(300), getDistrictDigitalTwin);
router.get('/skill-intelligence/:districtId/:skillName', cacheMiddleware(300), getSkillIntelligence);
router.get('/states', cacheMiddleware(600), getRegisteredStates);
router.post('/simulate', runWhatIfSimulation);
router.get('/placement-insights', getStatePlacementInsights);
router.get('/forecast', cacheMiddleware(300), getForecastIntelligence);
router.post('/forecast/insights', generateForecastInsights);
router.get('/sector-matrix', cacheMiddleware(300), getSectorMatrix);
router.get('/migration', cacheMiddleware(300), getMigrationAnalysis);
router.get('/active-districts', cacheMiddleware(300), getActiveDistricts);

export default router;
