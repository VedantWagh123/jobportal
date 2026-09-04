import express from 'express';
import { getAdminProfile, loginAdmin } from '../controllers/adminAuthController.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', protectAdmin, getAdminProfile);

export default router;
