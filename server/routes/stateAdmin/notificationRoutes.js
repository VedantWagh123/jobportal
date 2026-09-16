import express from 'express';
import { getStateAdminNotifications, markStateAdminNotificationsRead } from '../../controllers/stateAdminNotificationController.js';
import { protectAdmin } from '../../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.get('/', protectAdmin, getStateAdminNotifications);
router.post('/read', protectAdmin, markStateAdminNotificationsRead);
    router.post('/send-requirement', protectAdmin, async (req, res) => {
    try {
        const { instituteId, districtId, skillTarget, capacity, deadline, message, title } = req.body;
        // Import InstituteNotification dynamically to avoid circular dep issues in routes
        const InstituteNotification = (await import('../../models/InstituteNotification.js')).default;
        const TrainingInstitute = (await import('../../models/TrainingInstitute.js')).default;
        const District = (await import('../../models/District.js')).default;
        
        const finalTitle = title || `Government Requirement: ${skillTarget}`;
        
        let notifMessage;
        if (capacity && deadline) {
            notifMessage = `The State Government has identified a high market demand for ${skillTarget}. You are requested to start a batch with a capacity of ${capacity} by ${new Date(deadline).toLocaleDateString()}. Additional instructions: ${message || 'None'}`;
        } else {
            notifMessage = message || `The State Government has identified a high market demand for ${skillTarget}. Please align your training batches to meet this demand.`;
        }
        
        let targetDistrictId = null;

        if (districtId) {
            // Broadcast to all institutes in the district
            const institutes = await TrainingInstitute.find({ districtId }).lean();
            if (institutes.length > 0) {
                const notifications = institutes.map(inst => ({
                    instituteId: inst._id,
                    title: finalTitle,
                    message: notifMessage,
                    type: 'ActionRequired'
                }));
                await InstituteNotification.insertMany(notifications);
            }
            targetDistrictId = districtId;
        } else if (instituteId) {
            // Send to a single institute
            await InstituteNotification.create({
                instituteId,
                title: finalTitle,
                message: notifMessage,
                type: 'ActionRequired'
            });
            const institute = await TrainingInstitute.findById(instituteId).lean();
            if (institute) {
                targetDistrictId = institute.districtId;
            }
        } else {
            return res.status(400).json({ success: false, message: 'Either instituteId or districtId must be provided' });
        }

        // Update district actionedSkills to hide these skills from Top Demanded 
        if (skillTarget && targetDistrictId) {
            const skillsArray = skillTarget.split(',').map(s => s.trim()).filter(Boolean);
            await District.findByIdAndUpdate(targetDistrictId, {
                $addToSet: { actionedSkills: { $each: skillsArray } }
            });
        }
        
        res.json({ success: true, message: 'Requirement sent successfully' });
    } catch (error) {
        console.error('Send Req Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
