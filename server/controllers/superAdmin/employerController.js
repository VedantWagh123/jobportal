import Company from '../../models/Company.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import UserNotification from '../../models/UserNotification.js';

// @desc    Get all employers
// @route   GET /api/super-admin/employers
// @access  Private/SuperAdmin
export const getAllEmployers = async (req, res) => {
    try {
        const employers = await Company.find().select('-password').sort({ _id: -1 });
        
        // Add job count for each employer
        const employersData = await Promise.all(employers.map(async (emp) => {
            const jobCount = await Job.countDocuments({ companyId: emp._id });
            return { ...emp.toObject(), jobCount };
        }));

        res.json({ success: true, employers: employersData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update employer status
// @route   PUT /api/super-admin/employers/:id/status
// @access  Private/SuperAdmin
export const updateEmployerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['Pending', 'Approved', 'Banned'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const employer = await Company.findById(req.params.id);
        
        if (!employer) {
            return res.status(404).json({ success: false, message: 'Employer not found' });
        }

        const previousStatus = employer.status;
        employer.status = status;
        await employer.save();

        // If newly approved, check if there's a client/user with same email and send notification
        if (status === 'Approved' && previousStatus !== 'Approved') {
            const user = await User.findOne({ email: employer.email });
            if (user) {
                await UserNotification.create({
                    userId: user._id,
                    type: 'System',
                    title: 'Employer Account Approved 🎉',
                    message: `Your employer account for "${employer.name}" has been approved! You can now access your dashboard to post and manage jobs.`,
                    link: '/dashboard'
                });
            }
        }

        res.json({ success: true, message: `Employer status updated to ${status}`, employer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete employer
// @route   DELETE /api/super-admin/employers/:id
// @access  Private/SuperAdmin
export const deleteEmployer = async (req, res) => {
    try {
        const employer = await Company.findByIdAndDelete(req.params.id);
        
        if (!employer) {
            return res.status(404).json({ success: false, message: 'Employer not found' });
        }
        
        // Optionally, delete all jobs posted by this employer
        await Job.deleteMany({ companyId: req.params.id });

        res.json({ success: true, message: 'Employer and their jobs have been deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all jobs posted by a specific employer
// @route   GET /api/super-admin/employers/:id/jobs
// @access  Private/SuperAdmin
export const getEmployerJobs = async (req, res) => {
    try {
        const employer = await Company.findById(req.params.id).select('name image email status');
        if (!employer) {
            return res.status(404).json({ success: false, message: 'Employer not found' });
        }

        const jobs = await Job.find({ companyId: req.params.id }).sort({ date: -1 });
        
        res.json({ success: true, employer, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
