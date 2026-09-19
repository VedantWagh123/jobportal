import User from "../models/User.js";
import JobApplication from "../models/JobApplication.js";
import Enrollment from "../models/Enrollment.js";

// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        // Count total users
        const total = await User.countDocuments();

        // Fetch users
        const users = await User.find({})
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        res.json({
            success: true,
            users,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("SuperAdmin getAllUsers Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single User Details and History
export const getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Fetch Applications
        const applications = await JobApplication.find({ userId })
            .populate({ path: 'jobId', select: 'title category' })
            .populate({ path: 'companyId', select: 'name image' })
            .sort({ date: -1 })
            .lean();

        // Fetch Enrollments
        const enrollments = await Enrollment.find({ userId })
            .populate({ 
                path: 'batchId', 
                select: 'batchCode startDate endDate',
                populate: [
                    { path: 'courseId', select: 'name category' },
                    { path: 'instituteId', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 })
            .lean();

        // Combine history into a timeline
        const history = [];

        applications.forEach(app => {
            history.push({
                type: 'Application',
                date: app.date || app.createdAt,
                title: app.jobId?.title || 'Unknown Job',
                organization: app.companyId?.name || 'Unknown Company',
                status: app.status
            });
        });

        enrollments.forEach(enr => {
            history.push({
                type: 'Enrollment',
                date: enr.createdAt,
                title: enr.batchId?.courseId?.name || 'Unknown Course',
                organization: enr.batchId?.instituteId?.name || 'Unknown Institute',
                status: enr.status || 'Active'
            });
        });

        // Sort history by date descending
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            user,
            history
        });
    } catch (error) {
        console.error("SuperAdmin getUserHistory Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Also delete their applications and enrollments to clean up DB
        await JobApplication.deleteMany({ userId });
        await Enrollment.deleteMany({ userId });

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("SuperAdmin deleteUser Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
