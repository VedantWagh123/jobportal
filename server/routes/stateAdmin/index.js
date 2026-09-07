import express from 'express';
import authRoutes from './authRoutes.js';
import intelligenceRoutes from './intelligenceRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/intelligence', intelligenceRoutes);

export default router;
