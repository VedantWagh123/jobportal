import express from 'express';
import { registerInstitute, loginInstitute, getInstituteProfile, updateInstituteProfile, getPublicDistricts } from '../../controllers/institute/instituteAuthController.js';
import { protectInstitute } from '../../middleware/instituteAuthMiddleware.js';
import upload from '../../config/multer.js';

const router = express.Router();

router.post('/register', registerInstitute);
router.post('/login', loginInstitute);
router.get('/districts', getPublicDistricts);
router.get('/me', protectInstitute, getInstituteProfile);
router.put('/profile', protectInstitute, upload.single('image'), updateInstituteProfile);

export default router;
