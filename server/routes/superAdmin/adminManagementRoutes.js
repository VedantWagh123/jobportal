import express from 'express';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';
import { getAdmins, createAdmin, deleteAdmin } from '../../controllers/superAdmin/adminManagementController.js';
import upload from '../../config/multer.js';

const router = express.Router();

router.use(protectSuperAdmin);

router.get('/', getAdmins);
router.post('/', upload.single('image'), createAdmin);
router.delete('/:id', deleteAdmin);

export default router;
