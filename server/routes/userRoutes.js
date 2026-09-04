import express from 'express'
import { applyForJob, getUserData, syncUser, getUserJobApplications, updateUserResume, updateUserSkills, getTargetJobs, getCareerAnalysis } from '../controllers/userController.js'
import upload from '../config/multer.js'


const router = express.Router()

// Get user Data
router.get('/user', getUserData)

// Sync user Data
router.post('/sync', syncUser)

// Apply for a job
router.post('/apply', applyForJob)

// Get applied jobs data
router.get('/applications', getUserJobApplications)

// Update user profile (resume)
router.post('/update-resume', upload.single('resume'), updateUserResume)

// Update user profile (skills)
router.post('/update-skills', updateUserSkills)

// Career Path APIs
router.get('/career/jobs', getTargetJobs)
router.get('/career/skill-gap/:jobId', getCareerAnalysis)

// Institute Quality Scores
import { getInstituteScores } from '../controllers/feedbackController.js';
router.get('/institute-scores', getInstituteScores)

export default router;