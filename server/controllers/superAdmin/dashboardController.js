import Skill from '../../models/Skill.js';
import UnresolvedSkill from '../../models/UnresolvedSkill.js';
import GovernmentAdmin from '../../models/GovernmentAdmin.js';
import Job from '../../models/Job.js';
import IntelligenceService from '../../services/intelligenceService.js';

// @desc    Get dashboard statistics
// @route   GET /api/super-admin/dashboard/stats
// @access  Private/SuperAdmin
export const getDashboardStats = async (req, res) => {
    try {
        const totalSkills = await Skill.countDocuments();
        const unresolvedSkills = await UnresolvedSkill.countDocuments();
        const stateAdmins = await GovernmentAdmin.countDocuments({ isActive: true });
        
        // Calculate AI Process Rate & Total Vacancies
        const jobs = await Job.find({ visible: true }, 'vacancies intelligenceStatus').lean();
        const totalJobs = jobs.length;
        const failedJobs = jobs.filter(j => j.intelligenceStatus === 'Failed').length;
        
        // Accurate real-time sum of vacancies for consistency with state dashboard
        const totalVacancies = jobs.reduce((sum, j) => sum + (j.vacancies || 1), 0);
        
        let aiProcessRate = 100;
        if (totalJobs > 0) {
            aiProcessRate = (((totalJobs - failedJobs) / totalJobs) * 100).toFixed(1);
        }
        
        // Fetch real supply vs demand analytics from the common service
        const analytics = await IntelligenceService.getDashboardAnalytics({});

        res.json({
            totalSkills,
            unresolvedSkills,
            stateAdmins,
            totalVacancies,
            aiProcessRate: `${aiProcessRate}%`,
            supplyVsDemand: analytics.supplyVsDemand,
            supplyGapTable: analytics.supplyGapTable
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};
