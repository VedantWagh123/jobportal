import express from 'express'
import { ChangeJobApplicationsStatus, changeVisiblity, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, editJob, registerCompany, extractJobSkills, getCompanyNotifications, markCompanyNotificationsRead, updateCompanyProfile, refreshCompanyToken } from '../controllers/companyController.js'
import upload from '../config/multer.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router = express.Router()

// Register a company
router.post('/register', upload.single('image'), registerCompany)

// Company login
router.post('/login', loginCompany)
router.post('/refresh', refreshCompanyToken)

// Get company data
router.get('/company', protectCompany, getCompanyData)

// Post a job
router.post('/post-job', protectCompany, postJob)

// Edit a job
router.put('/edit-job/:id', protectCompany, editJob)

// Extract Skills
router.post('/extract-skills', protectCompany, extractJobSkills)

// Get Applicants Data of Company
router.get('/applicants', protectCompany, getCompanyJobApplicants)

// Get  Company Job List
router.get('/list-jobs', protectCompany, getCompanyPostedJobs)

// Change Applcations Status 
router.post('/change-status', protectCompany, ChangeJobApplicationsStatus)

// Change Applcations Visiblity 
router.post('/change-visiblity', protectCompany, changeVisiblity)

// Feedback routes
import { submitFeedback, getJobSkillsForFeedback } from '../controllers/feedbackController.js';
router.post('/feedback', protectCompany, submitFeedback)
router.get('/job-skills/:jobId', protectCompany, getJobSkillsForFeedback)

// Notification routes
router.get('/notifications', protectCompany, getCompanyNotifications)
router.post('/notifications/read', protectCompany, markCompanyNotificationsRead)

// Profile update
router.post('/profile/update', protectCompany, upload.single('image'), updateCompanyProfile)

export default router