import express from 'express';
import { protectInstitute } from '../../middleware/instituteAuthMiddleware.js';
import upload from '../../config/multer.js';
import { 
    getMyCourses, createCourse, deleteCourse, updateCourseCurriculum, updateCourse,
    getMyBatches, createBatch, updateBatchStatus, updateBatch, getInstituteAlerts, extractCourseSkills, getBatchEnrollments, generateDashboardSummary, generateCoursePlan, getCurriculumGap
} from '../../controllers/institute/instituteCourseController.js';

const router = express.Router();

router.use(protectInstitute);

// Courses
router.get('/courses', getMyCourses);
router.post('/courses', upload.single('image'), createCourse);
router.post('/extract-skills', extractCourseSkills);
router.put('/courses/:id', upload.single('image'), updateCourse);
router.put('/courses/:id/curriculum', updateCourseCurriculum);
router.delete('/courses/:id', deleteCourse);

// Batches
router.get('/batches', getMyBatches);
router.post('/batches', createBatch);
router.put('/batches/:id', updateBatch);
router.put('/batches/:id/status', updateBatchStatus);
router.get('/batches/:batchId/enrollments', getBatchEnrollments);

// Alerts, AI Summary & Gap
router.get('/alerts', getInstituteAlerts);
router.post('/ai-summary', generateDashboardSummary);
router.post('/ai-course-plan', generateCoursePlan);
router.get('/curriculum-gap', getCurriculumGap);

export default router;
