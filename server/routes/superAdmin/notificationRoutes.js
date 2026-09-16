import express from 'express';
import { getAdminNotifications, markAdminNotificationsRead } from '../../controllers/adminNotificationController.js';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';

const router = express.Router();

router.get('/', protectSuperAdmin, getAdminNotifications);
router.post('/read', protectSuperAdmin, markAdminNotificationsRead);

export default router;
