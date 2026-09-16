import express from 'express';
import { protectSuperAdmin } from '../../middleware/superAdminAuthMiddleware.js';
import { getUnresolvedSkills, approveSkill, rejectSkill, getAllMasterSkills, deleteMasterSkill } from '../../controllers/superAdmin/skillController.js';

const router = express.Router();

router.use(protectSuperAdmin);

router.get('/unresolved', getUnresolvedSkills);
router.get('/master', getAllMasterSkills);
router.delete('/master/:id', deleteMasterSkill);
router.post('/unresolved/:id/approve', approveSkill);
router.delete('/unresolved/:id', rejectSkill);

export default router;
