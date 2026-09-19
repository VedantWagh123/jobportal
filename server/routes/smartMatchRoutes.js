import express from 'express';
import { upload, analyzeResume, getMatches, analyzeSkillGap } from '../controllers/smartMatchController.js';

const router = express.Router();

// Route to upload and analyze resume
router.post('/analyze', upload.single('resume'), analyzeResume);

// Route to fetch job matches based on analysis
router.post('/match', getMatches);

// Route to analyze skill gap
router.post('/analyze-gap', analyzeSkillGap);

export default router;
