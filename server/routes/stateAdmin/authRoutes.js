import express from 'express';
import { getAdminProfile, loginAdmin, refreshAdminToken } from '../../controllers/adminAuthController.js';
import { protectAdmin } from '../../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/refresh', refreshAdminToken);
router.get('/me', protectAdmin, getAdminProfile);

export default router;
