import express from 'express';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';
import { getAllEmployers, updateEmployerStatus, deleteEmployer, getEmployerJobs } from '../../controllers/superAdmin/employerController.js';

const router = express.Router();

router.use(protectSuperAdmin);

router.get('/', getAllEmployers);
router.put('/:id/status', updateEmployerStatus);
router.delete('/:id', deleteEmployer);
router.get('/:id/jobs', getEmployerJobs);

export default router;
