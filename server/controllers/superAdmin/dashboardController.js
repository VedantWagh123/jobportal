import Skill from '../../models/Skill.js';
import UnresolvedSkill from '../../models/UnresolvedSkill.js';
import GovernmentAdmin from '../../models/GovernmentAdmin.js';
import Job from '../../models/Job.js';

// @desc    Get dashboard statistics
// @route   GET /api/super-admin/dashboard/stats
// @access  Private/SuperAdmin
export const getDashboardStats = async (req, res) => {
    try {
        const totalSkills = await Skill.countDocuments();
        const unresolvedSkills = await UnresolvedSkill.countDocuments();
        const stateAdmins = await GovernmentAdmin.countDocuments({ isActive: true });
        
        // Calculate AI Process Rate
        const totalJobs = await Job.countDocuments();
        const failedJobs = await Job.countDocuments({ intelligenceStatus: 'Failed' });
        
        let aiProcessRate = 100;
        if (totalJobs > 0) {
            aiProcessRate = (((totalJobs - failedJobs) / totalJobs) * 100).toFixed(1);
        }

        res.json({
            totalSkills,
            unresolvedSkills,
            stateAdmins,
            aiProcessRate: `${aiProcessRate}%`
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};
