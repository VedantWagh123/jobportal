import TrainingInstitute from '../../models/TrainingInstitute.js';

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
