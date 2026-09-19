import express from 'express';
import { authSuperAdmin, getSuperAdminProfile, refreshSuperAdminToken } from '../../controllers/superAdmin/authController.js';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';

const router = express.Router();

router.post('/login', authSuperAdmin);
router.post('/refresh', refreshSuperAdminToken);
router.get('/profile', protectSuperAdmin, getSuperAdminProfile);

export default router;
