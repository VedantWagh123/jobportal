import express from 'express';
import { getSettings, updateSettings } from '../../controllers/superAdminSettingsController.js';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';

const router = express.Router();

// Apply auth middleware to all settings routes
router.use(protectSuperAdmin);

router.get('/', getSettings);
router.post('/', updateSettings);

export default router;
