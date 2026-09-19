import Skill from '../../models/Skill.js';
import UnresolvedSkill from '../../models/UnresolvedSkill.js';
import GovernmentAdmin from '../../models/GovernmentAdmin.js';
import Job from '../../models/Job.js';
import District from '../../models/District.js';
import Company from '../../models/Company.js';
import TrainingInstitute from '../../models/TrainingInstitute.js';
import SuperAdminNotification from '../../models/SuperAdminNotification.js';
import User from '../../models/User.js';

// Helper: last 6 months array structure
const getLast6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            month: d.toLocaleString('default', { month: 'short' }),
            year: d.getFullYear(),
            monthIndex: d.getMonth(),
            Candidates: 0,
            Employers: 0,
            Institutes: 0
        });
    }
    return months;
};

// State name → SVG map ID
const STATE_TO_SVG = {
    'andhra pradesh': 'in-ap', 'arunachal pradesh': 'in-ar', 'assam': 'in-as',
    'bihar': 'in-br', 'chhattisgarh': 'in-ct', 'goa': 'in-ga', 'gujarat': 'in-gj',
    'haryana': 'in-hr', 'himachal pradesh': 'in-hp', 'jharkhand': 'in-jh',
    'karnataka': 'in-ka', 'kerala': 'in-kl', 'madhya pradesh': 'in-mp',
    'maharashtra': 'in-mh', 'manipur': 'in-mn', 'meghalaya': 'in-ml',
    'mizoram': 'in-mz', 'nagaland': 'in-nl', 'odisha': 'in-or', 'punjab': 'in-pb',
    'rajasthan': 'in-rj', 'sikkim': 'in-sk', 'tamil nadu': 'in-tn', 'telangana': 'in-tg',
    'tripura': 'in-tr', 'uttar pradesh': 'in-up', 'uttarakhand': 'in-ut',
    'west bengal': 'in-wb', 'delhi': 'in-dl', 'jammu and kashmir': 'in-jk'
};

// @desc    Get dashboard statistics - FAST VERSION using Promise.all
// @route   GET /api/super-admin/dashboard/stats
// @access  Private/SuperAdmin
export const getDashboardStats = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        // ── Run ALL queries in PARALLEL for speed ──────────────────────────────
        const [
            totalCandidates,
            totalEmployers,
            pendingEmployersCount,
            totalInstitutes,
            pendingInstitutesCount,
            approvedInstitutesCount,
            activeAdmins,
            jobs,
            totalSkills,
            unresolvedSkills,
            recentPendingEmployers,
            recentPendingInstitutes,
            recentActivitiesRaw,
            distinctStates,
            activeDistrictsCount,
            recentUsers,
            recentCompanies,
            recentInsts,
            jobsByCategory,
            latestUserNames,
            latestCompanyNames,
            latestInstituteNames,
        ] = await Promise.all([
            User.countDocuments(),
            Company.countDocuments(),
            Company.countDocuments({ status: 'Pending' }),
            TrainingInstitute.countDocuments(),
            TrainingInstitute.countDocuments({ isApproved: false }),
            TrainingInstitute.countDocuments({ isApproved: true }),
            GovernmentAdmin.countDocuments({ isActive: true }),
            Job.find({}, 'intelligenceStatus').lean(),
            Skill.countDocuments(),
            UnresolvedSkill.countDocuments(),
            Company.find({ status: 'Pending' })
                .select('name email location createdAt')
                .sort({ _id: -1 }).limit(5).lean(),
            TrainingInstitute.find({ isApproved: false })
                .select('name email type createdAt')
                .sort({ _id: -1 }).limit(5).lean(),
            SuperAdminNotification.find({}).sort({ _id: -1 }).limit(5).lean(),
            District.distinct('state'),
            District.countDocuments(),
            User.find({ createdAt: { $gte: sixMonthsAgo } }).select('name createdAt').lean(),
            Company.find({ createdAt: { $gte: sixMonthsAgo } }).select('name createdAt').lean(),
            TrainingInstitute.find({ createdAt: { $gte: sixMonthsAgo } }).select('name createdAt').lean(),
            Job.aggregate([
                { $match: { visible: true } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 6 }
            ]),
            User.find().sort({ _id: -1 }).limit(7).select('name').lean(),
            Company.find().sort({ _id: -1 }).limit(7).select('name').lean(),
            TrainingInstitute.find().sort({ _id: -1 }).limit(7).select('name').lean(),
        ]);

        // ── Registrations Overview (last 6 months) ─────────────────────────────
        const registrationsOverview = getLast6Months();

        recentUsers.forEach(u => {
            if (u.createdAt) {
                const d = new Date(u.createdAt);
                const t = registrationsOverview.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
                if (t) t.Candidates++;
            }
        });
        recentCompanies.forEach(c => {
            if (c.createdAt) {
                const d = new Date(c.createdAt);
                const t = registrationsOverview.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
                if (t) t.Employers++;
            }
        });
        recentInsts.forEach(i => {
            if (i.createdAt) {
                const d = new Date(i.createdAt);
                const t = registrationsOverview.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
                if (t) t.Institutes++;
            }
        });

        // ── Skill Domains from Job Categories (fast, no heavy aggregation) ──────
        const totalJobsForSkills = jobsByCategory.reduce((sum, c) => sum + c.count, 0) || 1;
        const skillDomains = jobsByCategory.map(c => ({
            name: c._id || 'Others',
            value: Math.round((c.count / totalJobsForSkills) * 100)
        }));

        // ── Network Presence ───────────────────────────────────────────────────
        const activeStates = distinctStates
            .map(s => STATE_TO_SVG[s?.toLowerCase()?.trim()])
            .filter(Boolean);

        const networkPresence = {
            totalInstitutes,
            activeDistricts: activeDistrictsCount,
            statesUTs: distinctStates.length,
            activeStates
        };

        // ── Pending Approvals Queue ────────────────────────────────────────────
        const pendingApprovalsQueue = [
            ...recentPendingEmployers.map(e => ({
                ...e,
                accountType: 'Employer',
                date: e.createdAt || Date.now()
            })),
            ...recentPendingInstitutes.map(i => ({
                ...i,
                accountType: 'Institute',
                date: i.createdAt || Date.now()
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        // ── AI Background Task Queue ───────────────────────────────────────────
        const totalJobs = jobs.length;
        let jobMatchingProgress = totalJobs > 0 ? 0 : 100;
        let resumeProcessing = totalJobs > 0 ? 0 : 100;
        const skillExtraction = (totalSkills > 0 || unresolvedSkills > 0)
            ? Math.max(0, Math.round((totalSkills / (totalSkills + unresolvedSkills)) * 100))
            : 100;
        const instVerification = totalInstitutes > 0
            ? Math.max(0, Math.round((approvedInstitutesCount / totalInstitutes) * 100))
            : 100;

        if (totalJobs > 0) {
            const completedJobs = jobs.filter(j => j.intelligenceStatus === 'Completed').length;
            jobMatchingProgress = Math.max(0, Math.round((completedJobs / totalJobs) * 100));
            resumeProcessing = Math.min(jobMatchingProgress + 15, 100);
        }

        const aiQueue = [
            { name: 'Resume Processing',     progress: resumeProcessing,    color: '#3B82F6' },
            { name: 'Skill Extraction (AI)', progress: skillExtraction,      color: '#10B981' },
            { name: 'Job Matching',          progress: jobMatchingProgress,  color: '#8B5CF6' },
            { name: 'Institute Verification',progress: instVerification,     color: '#F97316' },
            { name: 'Data Sync (States)',    progress: distinctStates.length > 0 ? 100 : 0, color: '#14B8A6' }
        ];

        const aiProcessRate = Math.round(
            [resumeProcessing, skillExtraction, jobMatchingProgress, instVerification].reduce((a, b) => a + b, 0) / 4
        ) || 0;

        // ── Recent Activities ──────────────────────────────────────────────────
        const recentActivities = recentActivitiesRaw.map(n => ({
            _id: n._id,
            type: n.type,
            title: n.title,
            subtitle: n.message,
            date: n.date || n.createdAt
        }));

        const recentNames = {
            candidates: latestUserNames.map(u => u.name).filter(Boolean),
            employers: latestCompanyNames.map(c => c.name).filter(Boolean),
            institutes: latestInstituteNames.map(i => i.name).filter(Boolean),
            pendingEmployers: recentPendingEmployers.map(c => c.name).filter(Boolean),
            pendingInstitutes: recentPendingInstitutes.map(i => i.name).filter(Boolean)
        };

        // ── Send Response ──────────────────────────────────────────────────────
        return res.json({
            success: true,
            totalCandidates,
            totalEmployers,
            pendingEmployers: pendingEmployersCount,
            totalInstitutes,
            pendingInstitutes: pendingInstitutesCount,
            activeAdmins,
            registrationsOverview,
            skillDomains,
            networkPresence,
            pendingApprovalsQueue,
            aiQueue,
            aiProcessRate: `${aiProcessRate}%`,
            recentActivities,
            recentNames
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};
