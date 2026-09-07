import express from 'express';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';
import { getDashboardStats } from '../../controllers/superAdmin/dashboardController.js';

const router = express.Router();

router.use(protectSuperAdmin);

router.get('/stats', getDashboardStats);

export default router;
