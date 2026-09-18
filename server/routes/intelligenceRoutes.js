import express from 'express';
import { parseJobManually, getIntelligenceStatus, askSmartAssistant } from '../controllers/intelligenceController.js';

const router = express.Router();

router.post('/parse-job', parseJobManually);
router.get('/status/:jobId', getIntelligenceStatus);
router.post('/ask', askSmartAssistant);

export default router;
