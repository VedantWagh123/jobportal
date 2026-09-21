import express from 'express';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';
import { getAiCommandCenterData, sendGlobalAiWarning } from '../../controllers/superAdmin/aiCommandCenterController.js';

const router = express.Router();

router.use(protectSuperAdmin);

router.get('/stats', getAiCommandCenterData);
router.post('/alert-users', sendGlobalAiWarning);

export default router;
