import express from 'express'
import { applyForJob, getUserData, syncUser, getUserJobApplications, updateUserResume, completeUserProfile, updateUserSkills, getTargetJobs, getCareerAnalysis, getMarketRecommendations, enrollInBatch, extractResumeSkillsAPI } from '../controllers/userController.js'
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

// Update user profile (resume only)
router.post('/update-resume', upload.single('resume'), updateUserResume)

// Complete user profile (multi-step form)
router.post('/complete-profile', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'image', maxCount: 1 }]), completeUserProfile)

// Update user profile (skills)
router.post('/update-skills', updateUserSkills)

// Extract Skills directly from uploaded resume (No DB save)
router.post('/extract-resume-skills', upload.single('resume'), extractResumeSkillsAPI)

// Career Path APIs
router.get('/career/jobs', getTargetJobs)
router.get('/career/skill-gap/:jobId', getCareerAnalysis)
router.get('/career/market-recommendations', getMarketRecommendations)

// Batch Enrollment
router.post('/enroll', enrollInBatch)

// Institute Quality Scores
import { getInstituteScores } from '../controllers/feedbackController.js';
router.get('/institute-scores', getInstituteScores)

// Chatbot
import { chatWithAI } from '../controllers/chatbotController.js';
router.post('/chat', chatWithAI);

export default router;