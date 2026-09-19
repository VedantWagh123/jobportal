import TrainingInstitute from '../../models/TrainingInstitute.js';
import User from '../../models/User.js';
import UserNotification from '../../models/UserNotification.js';
import { getIO } from '../../config/socket.js';

// Get all institutes (both approved and pending)
export const getInstitutes = async (req, res) => {
    try {
        const institutes = await TrainingInstitute.find().populate('districtId', 'name');
        res.json({ success: true, institutes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Approve an institute
export const approveInstitute = async (req, res) => {
    try {
        const institute = await TrainingInstitute.findById(req.params.id);
        if (!institute) {
            return res.status(404).json({ success: false, message: 'Institute not found' });
        }
        
        institute.isApproved = true;
        await institute.save();

        // Send approval notification to linked User account
        const user = await User.findOne({ email: institute.email });
        if (user) {
            const message = `Your institute account for "${institute.name}" has been approved! You can now log in to the institute dashboard.`;
            await UserNotification.create({
                userId: user._id,
                type: 'System',
                title: 'Institute Account Approved 🎉',
                message,
                link: '/institute'
            });

            try {
                const io = getIO();
                io.emit('candidate_notification', { 
                    userId: user._id.toString(), 
                    message, 
                    type: 'system' 
                });
            } catch (err) {
                console.error("Socket error:", err.message);
            }
        }

        res.json({ success: true, message: 'Institute approved successfully', institute });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Reject/Delete an institute
export const rejectInstitute = async (req, res) => {
    try {
        const institute = await TrainingInstitute.findByIdAndDelete(req.params.id);
        if (!institute) {
            return res.status(404).json({ success: false, message: 'Institute not found' });
        }
        res.json({ success: true, message: 'Institute rejected and removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
