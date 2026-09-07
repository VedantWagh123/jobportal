import express from 'express';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';
import { getAllEmployers, updateEmployerStatus, deleteEmployer } from '../../controllers/superAdmin/employerController.js';

const router = express.Router();

router.use(protectSuperAdmin);

router.get('/', getAllEmployers);
router.put('/:id/status', updateEmployerStatus);
router.delete('/:id', deleteEmployer);

export default router;
