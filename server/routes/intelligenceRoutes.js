import express from 'express';
import { parseJobManually, getIntelligenceStatus } from '../controllers/intelligenceController.js';

const router = express.Router();

router.post('/parse-job', parseJobManually);
router.get('/status/:jobId', getIntelligenceStatus);

export default router;
