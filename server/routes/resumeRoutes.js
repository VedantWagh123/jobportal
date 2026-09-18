import express from 'express';
import multer from 'multer';
import { 
    getUserResumes, 
    getResumeById, 
    createResume, 
    duplicateResume, 
    updateResume, 
    deleteResume, 
    downloadPdf, 
    improveWithAI, 
    analyzeJobDescription,
    generateAtsScore,
    uploadResumeAndExtract
} from '../controllers/resumeController.js';
import { requireUser } from '../middleware/requireUser.js';

const router = express.Router();

// Setup Multer for memory storage (for processing files before saving/discarding)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All resume routes require authentication
router.use(requireUser);

// Upload & Extract route
router.post('/upload', upload.single('resumeFile'), uploadResumeAndExtract);

// CRUD routes
router.get('/', getUserResumes);
router.post('/', createResume);
router.get('/:id', getResumeById);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.post('/:id/duplicate', duplicateResume);

// PDF Generation
router.post('/:id/pdf', downloadPdf);

// AI Routes
router.post('/ai/improve', improveWithAI);
router.post('/ai/analyze-job', analyzeJobDescription);
router.post('/ai/ats-score', generateAtsScore);

export default router;
