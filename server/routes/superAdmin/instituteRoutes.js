import express from 'express';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';
import { getInstitutes, approveInstitute, rejectInstitute } from '../../controllers/superAdmin/instituteManagementController.js';

const router = express.Router();

router.use(protectSuperAdmin);

router.get('/', getInstitutes);
router.put('/:id/approve', approveInstitute);
router.delete('/:id/reject', rejectInstitute);

export default router;
