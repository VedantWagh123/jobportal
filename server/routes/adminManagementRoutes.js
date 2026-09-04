import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';

import { createDistrict, getDistricts, getDistrictById, updateDistrict } from '../controllers/adminDistrictController.js';
import { createInstitute, getInstitutes, getInstituteById, updateInstitute } from '../controllers/adminInstituteController.js';
import { createCourse, getCourses, getCourseById, updateCourse } from '../controllers/adminCourseController.js';
import { createCourseSkill, getCourseSkills, updateCourseSkill, deleteCourseSkill } from '../controllers/adminCourseSkillController.js';
import { createBatch, getBatches, getBatchById, updateBatch } from '../controllers/adminBatchController.js';
import { createEnrollment, getEnrollments, getEnrollmentById, updateEnrollment, getAdminUsers, getAdminCompanies } from '../controllers/adminEnrollmentController.js';
import { getIntelligenceDashboard } from '../controllers/adminAnalyticsController.js';

const router = express.Router();

// ALL ROUTES ARE PROTECTED
router.use(protectAdmin);

// Analytics API
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
router.get('/analytics/dashboard', cacheMiddleware(300), getIntelligenceDashboard);

// District APIs
router.post('/districts', createDistrict);
router.get('/districts', getDistricts);
router.get('/districts/:id', getDistrictById);
router.put('/districts/:id', updateDistrict);

// Institute APIs
router.post('/institutes', createInstitute);
router.get('/institutes', getInstitutes);
router.get('/institutes/:id', getInstituteById);
router.put('/institutes/:id', updateInstitute);

// Course APIs
router.post('/courses', createCourse);
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.put('/courses/:id', updateCourse);

// CourseSkill APIs
router.post('/course-skills', createCourseSkill);
router.get('/course-skills', getCourseSkills);
router.put('/course-skills/:id', updateCourseSkill);
router.delete('/course-skills/:id', deleteCourseSkill);

// Batch APIs
router.post('/batches', createBatch);
router.get('/batches', getBatches);
router.get('/batches/:id', getBatchById);
router.put('/batches/:id', updateBatch);

// Enrollment APIs
router.post('/enrollments', createEnrollment);
router.get('/enrollments', getEnrollments);
router.get('/enrollments/:id', getEnrollmentById);
router.put('/enrollments/:id', updateEnrollment);

// Reference Data for Dropdowns
router.get('/users', getAdminUsers);
router.get('/companies', getAdminCompanies);

// Institute Quality Scores
import { getInstituteScores } from '../controllers/feedbackController.js';
router.get('/institute-scores', getInstituteScores);

export default router;
