import express from 'express';
import { protectInstitute } from '../../middleware/instituteAuthMiddleware.js';
import { 
    getMyCourses, createCourse, deleteCourse,
    getMyBatches, createBatch, updateBatchStatus, updateBatch, getInstituteAlerts, extractCourseSkills, getBatchEnrollments
} from '../../controllers/institute/instituteCourseController.js';

const router = express.Router();

router.use(protectInstitute);

// Courses
router.get('/courses', getMyCourses);
router.post('/courses', createCourse);
router.post('/extract-skills', extractCourseSkills);
router.delete('/courses/:id', deleteCourse);

// Batches
router.get('/batches', getMyBatches);
router.post('/batches', createBatch);
router.put('/batches/:id', updateBatch);
router.put('/batches/:id/status', updateBatchStatus);
router.get('/batches/:batchId/enrollments', getBatchEnrollments);

// Alerts
router.get('/alerts', getInstituteAlerts);

export default router;
