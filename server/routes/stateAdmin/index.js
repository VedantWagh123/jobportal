import express from 'express';
import authRoutes from './authRoutes.js';
import intelligenceRoutes from './intelligenceRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/intelligence', intelligenceRoutes);
router.use('/notifications', notificationRoutes);

export default router;
