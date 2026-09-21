import express from 'express';
import authRoutes from './authRoutes.js';
import skillRoutes from './skillRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import adminManagementRoutes from './adminManagementRoutes.js';
import instituteRoutes from './instituteRoutes.js';
import employerRoutes from './employerRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import userRoutes from './userRoutes.js';
import aiCommandCenterRoutes from './aiCommandCenterRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/skills', skillRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admins', adminManagementRoutes);
router.use('/institutes', instituteRoutes);
router.use('/employers', employerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);
router.use('/users', userRoutes);
router.use('/ai-command-center', aiCommandCenterRoutes);

export default router;
