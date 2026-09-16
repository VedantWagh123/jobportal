import Skill from '../../models/Skill.js';
import UnresolvedSkill from '../../models/UnresolvedSkill.js';
import GovernmentAdmin from '../../models/GovernmentAdmin.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import EmployerFeedback from '../../models/EmployerFeedback.js';
import District from '../../models/District.js';
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
        
        // Calculate Available Supply (Total Registered Candidates)
        const availableSupply = await User.countDocuments();
        
        // Calculate Placement Rate from EmployerFeedback
        const feedbacks = await EmployerFeedback.find({}, 'finalStatus').lean();
        let placementRate = 0;
        if (feedbacks.length > 0) {
            const hiredCount = feedbacks.filter(f => f.finalStatus === 'Hired').length;
            placementRate = Math.round((hiredCount / feedbacks.length) * 100);
        }

        // Calculate Geographical Analytics (State-wise Readiness)
        // Grouping jobs and capacity by State
        const districts = await District.find({}).lean();
        const stateMap = {};
        districts.forEach(d => {
            const state = d.state || 'Unknown';
            if (!stateMap[state]) stateMap[state] = { jobs: 0, capacity: 0 };
        });

        // We can get the detailed district intelligence from the service to sum up
        const districtIntell = await IntelligenceService.getDistrictIntelligence({});
        districtIntell.forEach(di => {
            const state = di.state;
            if (stateMap[state]) {
                stateMap[state].jobs += di.jobs || 0;
                stateMap[state].capacity += di.capacity || 0;
            }
        });

        const geographicalAnalytics = Object.keys(stateMap).map(state => {
            const data = stateMap[state];
            // Readiness is supply(capacity) over demand(jobs). Cap at 100%
            let readiness = 0;
            if (data.jobs > 0) {
                readiness = Math.round((data.capacity / data.jobs) * 100);
            } else if (data.capacity > 0) {
                readiness = 100;
            }
            return {
                name: state,
                val: `${Math.min(100, readiness)}%`,
                readinessValue: Math.min(100, readiness)
            };
        })
        .sort((a, b) => b.readinessValue - a.readinessValue)
        .slice(0, 5); // Top 5 states

        // Fetch real supply vs demand analytics from the common service
        const analytics = await IntelligenceService.getDashboardAnalytics({});

        res.json({
            totalSkills,
            unresolvedSkills,
            stateAdmins,
            totalVacancies,
            aiProcessRate: `${aiProcessRate}%`,
            availableSupply,
            placementRate: `${placementRate}%`,
            trainingCapacity: analytics.kpis.trainingCapacity,
            geographicalAnalytics,
            demandTrend: analytics.demandTrend,
            industryWiseDemand: analytics.industryWiseDemand,
            supplyVsDemand: analytics.supplyVsDemand,
            supplyGapTable: analytics.supplyGapTable
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};
