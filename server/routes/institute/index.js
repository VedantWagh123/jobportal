import express from 'express';
import { protectInstitute } from '../../middleware/instituteAuthMiddleware.js';
import authRoutes from './authRoutes.js';
import courseRoutes from './courseRoutes.js';

import { createInstitute, getInstitutes, getInstituteById, updateInstitute } from '../../controllers/adminInstituteController.js';
import { createCourse, getCourses, getCourseById, updateCourse } from '../../controllers/adminCourseController.js';
import { createBatch, getBatches, getBatchById, updateBatch } from '../../controllers/adminBatchController.js';
import { createEnrollment, getEnrollments, getEnrollmentById, updateEnrollment } from '../../controllers/adminEnrollmentController.js';

const router = express.Router();

router.use('/auth', authRoutes);

// Protect all routes below this line
router.use(protectInstitute);

router.use('/management', courseRoutes);

// Institute Profile APIs
router.post('/profile', createInstitute);
router.get('/profile', getInstitutes);
router.get('/profile/:id', getInstituteById);
router.put('/profile/:id', updateInstitute);

// Course APIs
router.post('/courses', createCourse);
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.put('/courses/:id', updateCourse);

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

// Placement Results (Employer Feedback for institute's students)
import { getInstitutePlacementResults } from '../../controllers/feedbackController.js';
router.get('/management/placement-results', getInstitutePlacementResults);

export default router;
