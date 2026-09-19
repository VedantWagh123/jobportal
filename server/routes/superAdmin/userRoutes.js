import express from 'express';
import { getAllUsers, getUserHistory, deleteUser } from '../../controllers/superAdminUserController.js';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';

const router = express.Router();

router.use(protectSuperAdmin);
router.get('/', getAllUsers);
router.get('/:userId/history', getUserHistory);
router.delete('/:userId', deleteUser);

export default router;
