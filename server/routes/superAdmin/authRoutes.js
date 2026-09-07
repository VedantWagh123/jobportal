import express from 'express';
import { authSuperAdmin, getSuperAdminProfile } from '../../controllers/superAdmin/authController.js';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';

const router = express.Router();

router.post('/login', authSuperAdmin);
router.get('/profile', protectSuperAdmin, getSuperAdminProfile);

export default router;
