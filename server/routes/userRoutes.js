import express from 'express'
import { applyForJob, getUserData, syncUser, getUserJobApplications, updateUserResume, completeUserProfile, updateUserSkills, getTargetJobs, getCareerAnalysis, getMarketRecommendations, enrollInBatch, extractResumeSkillsAPI, getAllPublicCourses, toggleSavedJob, syncResumeToProfile, extractProfileSkills, useLumiCredit } from '../controllers/userController.js'
import upload from '../config/multer.js'
import { requireUser } from '../middleware/requireUser.js'

const router = express.Router()

// Use Lumi Credit
router.post('/use-lumi-credit', requireUser, useLumiCredit)

// Get user Data (requireUser auto-creates/migrates the user record)
router.get('/user', requireUser, getUserData)

// Sync user Data (requireUser handles migration)
router.post('/sync', requireUser, syncUser)

// Apply for a job
router.post('/apply', requireUser, applyForJob)

// Toggle saved job
router.post('/toggle-saved-job', requireUser, toggleSavedJob)

// Get applied jobs data
router.get('/applications', requireUser, getUserJobApplications)

// Update user profile (resume only)
router.post('/update-resume', upload.single('resume'), requireUser, updateUserResume)

// Complete user profile (multi-step form)
router.post('/complete-profile', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'image', maxCount: 1 }]), requireUser, completeUserProfile)

// Update user profile (skills)
router.post('/update-skills', requireUser, updateUserSkills)

// Sync builder resume to profile
router.post('/profile/sync-builder-resume', requireUser, syncResumeToProfile)

// Extract Skills directly from uploaded resume (No DB save)
router.post('/extract-resume-skills', upload.single('resume'), extractResumeSkillsAPI)

// Extract Skills from Profile Resume
router.post('/profile/extract-skills', requireUser, extractProfileSkills)

// Career Path APIs
router.get('/career/jobs', getTargetJobs)
router.get('/career/skill-gap/:jobId', requireUser, getCareerAnalysis)
router.get('/career/market-recommendations', requireUser, getMarketRecommendations)

// Browse All Public Courses
router.get('/courses', getAllPublicCourses)

// Batch Enrollment
router.post('/enroll', requireUser, enrollInBatch)

// Institute Quality Scores
import { getInstituteScores } from '../controllers/feedbackController.js';
router.get('/institute-scores', getInstituteScores)

// Chatbot
import { chatWithAI } from '../controllers/chatbotController.js';
router.post('/chat', chatWithAI);

// Notifications
import { getUserNotifications, markUserNotificationsRead, submitCourseReview } from '../controllers/userController.js';
router.get('/notifications', requireUser, getUserNotifications);
router.put('/notifications/mark-read', requireUser, markUserNotificationsRead);

// Course Reviews
router.post('/course-review', requireUser, submitCourseReview);

export default router;